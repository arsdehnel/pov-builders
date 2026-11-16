import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk-template';
import matter from 'gray-matter';

class SyncError extends Error {
	public code: number | undefined;
	public data: Record<string, string[]> | undefined;

	constructor(code: number, message: string, data: Record<string, string[]>) {
		super();
		this.code = code;
		this.data = data;
		this.message = message;
	}
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'content', 'topics');

const STANCE_BUILD_API_HOST = process.env.STANCE_BUILD_API_HOST ?? 'http://localhost:5173';
const STANCE_BUILD_API_KEY = process.env.STANCE_BUILD_API_KEY;

if (!STANCE_BUILD_API_KEY) {
	console.error('Error: API_KEY environment variable is required');
	process.exit(1);
}

interface ApiResponse<T> {
	data: T;
}

interface Topic {
	id: string;
	subdomain: string;
	title: string;
}

interface Stance {
	id: string;
	topicId: string;
	slug: string;
	label: string;
	order: number;
}

interface Value {
	id: string;
	topicId: string;
	slug: string;
	label: string;
	description: string;
	order: number;
}

function toTitleCase(str: string): string {
	return str
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
	const res = await fetch(`${STANCE_BUILD_API_HOST}/api${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${STANCE_BUILD_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const text = await res.text();
		// const data = (await res.json()) as ApiResponse<T>;
		// console.log(text);
		// console.log(JSON.parse(text));
		throw new SyncError(res.status, `API ${method} ${path} failed (${res.status})`, JSON.parse(text));
	}

	const data = (await res.json()) as ApiResponse<T>;
	return data.data;
}

async function syncValues(topic: Topic, topicDir: string): Promise<void> {
	console.log(chalk`\n  👉 Starting values sync from {yellow ${topicDir}}`);
	const valuesDir = join(topicDir, 'values');
	let filenames: string[];
	try {
		filenames = (await readdir(valuesDir)).filter(f => f.endsWith('.mdx'));
	} catch {
		filenames = [];
	}

	const existing = await apiRequest<Value[]>('GET', `/topics/${topic.id}/values`);
	const existingBySlug = new Map(existing.map(v => [v.slug, v]));
	const contentSlugs = new Set<string>();

	for (const filename of filenames) {
		const slug = basename(filename, '.mdx');
		console.log(chalk`\n    👉 Processing value slug {yellow ${slug}}`);
		contentSlugs.add(slug);

		const content = await readFile(join(valuesDir, filename), 'utf-8');
		const fm = matter(content).data;

		if (!fm.description) {
			throw new Error(`Missing description frontmatter in ${join(valuesDir, filename)}`);
		}

		const payload = {
			slug,
			label: String(fm.title),
			description: String(fm.description),
			order: Number(fm.order),
		};

		const current = existingBySlug.get(slug);
		if (current) {
			await apiRequest('PUT', `/topics/${topic.id}/values/${current.id}`, payload);
			console.log(chalk`      ✅ Updated value: ${slug}`);
		} else {
			await apiRequest('POST', `/topics/${topic.id}/values`, payload);
			console.log(chalk`     ✅ Created value: ${slug}`);
		}
	}

	for (const value of existing) {
		if (!contentSlugs.has(value.slug)) {
			await apiRequest('DELETE', `/topics/${topic.id}/values/${value.id}`);
			console.log(chalk`      ✅ Deleted value: ${value.slug}`);
		}
	}
}

async function syncStances(topic: Topic, topicDir: string): Promise<void> {
	console.log(chalk`\n  👉 Starting stances sync from {yellow ${topicDir}}`);
	const stancesDir = join(topicDir, 'stances');
	let filenames: string[];
	try {
		filenames = (await readdir(stancesDir)).filter(f => f.endsWith('.mdx'));
	} catch {
		filenames = [];
	}

	const existing = await apiRequest<Stance[]>('GET', `/topics/${topic.id}/stances`);
	const existingBySlug = new Map(existing.map(s => [s.slug, s]));
	const contentSlugs = new Set<string>();

	for (const filename of filenames) {
		const slug = basename(filename, '.mdx');
		console.log(chalk`\n    👉 Processing stance slug {yellow ${slug}}`);
		contentSlugs.add(slug);

		const content = await readFile(join(stancesDir, filename), 'utf-8');
		const fm = matter(content).data;

		const payload = {
			slug,
			label: String(fm.title),
			order: Number(fm.order),
			color: String(fm.color),
			description: String(fm.description),
			example: String(fm.example),
			characterName: String(fm.characterName),
			characterTagline: String(fm.characterTagline),
			characterBio: String(fm.characterBio),
		};

		const current = existingBySlug.get(slug);
		if (current) {
			await apiRequest('PUT', `/topics/${topic.id}/stances/${current.id}`, payload);
			console.log(chalk`      ✅ Updated stance: ${slug}`);
		} else {
			await apiRequest('POST', `/topics/${topic.id}/stances`, payload);
			console.log(chalk`     ✅ Created stance: ${slug}`);
		}
	}

	for (const stance of existing) {
		if (!contentSlugs.has(stance.slug)) {
			await apiRequest('DELETE', `/topics/${topic.id}/stances/${stance.id}`);
			console.log(chalk`      ✅ Deleted stance: ${stance.slug}`);
		}
	}
}

async function main(): Promise<void> {
	console.log(chalk`\n📖 Readings local topics from {yellow ${CONTENT_DIR}}`);
	const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
	const topicDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
	const contentSubdomains = new Set(topicDirs);

	const existingTopics = await apiRequest<Topic[]>('GET', '/topics');
	const topicsBySubdomain = new Map(existingTopics.map(t => [t.subdomain, t]));

	for (const subdomain of topicDirs) {
		console.log(chalk`\n👉 Starting topic {yellow ${subdomain}}`);

		let topic = topicsBySubdomain.get(subdomain);
		if (!topic) {
			topic = await apiRequest<Topic>('POST', '/topics', {
				subdomain,
				title: toTitleCase(subdomain),
			});
			topicsBySubdomain.set(subdomain, topic);
			console.log(chalk`  ✅ Created topic (${topic.id})`);
		} else {
			console.log(chalk`  ✅ Found topic (${topic.id})`);
		}

		await syncValues(topic, join(CONTENT_DIR, subdomain));
		await syncStances(topic, join(CONTENT_DIR, subdomain));
	}

	for (const [subdomain, topic] of topicsBySubdomain) {
		if (!contentSubdomains.has(subdomain)) {
			await apiRequest('DELETE', `/topics/${topic.id}`);
			console.log(`Deleted topic: ${subdomain}`);
		}
	}
}

main()
	.then(() => console.log('\nSync complete'))
	.catch(err => {
		console.log(err);
		if (err.data) {
			console.error(chalk`\n🚨 Sync failed {red ${err.message}}:\n${JSON.stringify(err.data, null, 4)}`);
		} else {
			console.error(chalk`\n🚨 Sync failed {red ${err instanceof Error ? err.message : err}}`);
		}
		process.exit(1);
	});
