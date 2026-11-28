import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');

function getFiles(dir: string, exclude: string[] = []): string[] {
	const abs = join(SRC, dir);
	return (readdirSync(abs, { recursive: true, withFileTypes: true }) as import('fs').Dirent[])
		.filter(e => e.isFile() && /\.tsx?$/.test(e.name))
		.map(e => join(e.parentPath, e.name))
		.filter(p => !exclude.some(ex => p.includes(ex)));
}

function read(p: string): string {
	return readFileSync(p, 'utf-8');
}

function rel(p: string): string {
	return relative(SRC, p);
}

const SKIP = ['__tests__'];

// ─── Actions ──────────────────────────────────────────────────────────────────

describe('actions', () => {
	const files = getFiles('actions', SKIP);

	it("every action file has 'use server'", () => {
		const bad = files.filter(p => !read(p).includes("'use server'"));
		expect(bad.map(rel), "Missing 'use server'").toStrictEqual([]);
	});

	it('no action file uses export default', () => {
		const bad = files.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in actions').toStrictEqual([]);
	});

	it('no action file imports from @/models', () => {
		const bad = files.filter(p => /from ['"]@\/models['"/]/.test(read(p)));
		expect(bad.map(rel), 'Direct @/models import not allowed in actions; use @/repositories').toStrictEqual([]);
	});

	it('all serverAction calls include requireAuthentication', () => {
		const bad = files.filter(f => {
			const content = read(f);
			const matches = [...content.matchAll(/serverAction\(\[([\s\S]*?)\]\)/g)].map(m => String(m[1]));
			if (matches.length === 0) return false;
			return matches.some(m => !/requireAuthentication/.test(m));
		});
		expect(bad.map(rel), 'serverAction defined without requireAuthentication').toStrictEqual([]);
	});

	it('all serverAction calls include requirePermissions', () => {
		const bad = files.filter(f => {
			const content = read(f);
			const matches = [...content.matchAll(/serverAction\(\[([\s\S]*?)\]\)/g)].map(m => String(m[1]));
			if (matches.length === 0) return false;
			return matches.some(m => !/requirePermissions/.test(m));
		});
		expect(bad.map(rel), 'serverAction defined without requirePermissions').toStrictEqual([]);
	});
});

// ─── Repositories ──────────────────────────────────────────────────────────────

describe('repositories', () => {
	const files = getFiles('repositories', [...SKIP, 'index.ts', 'errors.ts']);

	it("no repository file has 'use server'", () => {
		const bad = files.filter(p => read(p).includes("'use server'"));
		expect(bad.map(rel), "'use server' not allowed in repositories").toStrictEqual([]);
	});

	it('no repository file uses export default', () => {
		const bad = files.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in repositories; use named exports').toStrictEqual([]);
	});
});

// ─── API handlers ─────────────────────────────────────────────────────────────

describe('api', () => {
	// _routes.ts and index.ts are routing/re-export files, not handler entry points
	const files = getFiles('api', [...SKIP, '_routes.ts', 'index.ts']);

	// Routes that are intentionally public — no requireAuthentication or requirePermissions
	const publicRoutes = new Set([
		'api/oauth/login.ts',
		'api/oauth/callback.ts',
		'api/oauth/client-metadata.ts',
		'api/well-known/atproto-did.ts',
	]);

	it("no API handler file has 'use server'", () => {
		const bad = files.filter(p => read(p).includes("'use server'"));
		expect(bad.map(rel), "'use server' not allowed in API handlers").toStrictEqual([]);
	});

	it('all non-default exports from API handlers are _-prefixed (private/test helpers)', () => {
		const bad: string[] = [];
		files.forEach(f => {
			const content = read(f);
			const relPath = rel(f);
			// Match named exports that are not _-prefixed
			[...content.matchAll(/^export(?! default)\s+(?:async\s+)?function\s+([^_]\w*)/gm)].forEach(m => {
				bad.push(`${relPath}: ${m[1]}`);
			});
			[...content.matchAll(/^export\s+(?:const|let)\s+([^_]\w*)/gm)].forEach(m => {
				bad.push(`${relPath}: ${m[1]}`);
			});
		});
		expect(bad, 'Non-default public exports must be _-prefixed in API handlers').toStrictEqual([]);
	});

	it('all authenticated API handlers include requireAuthentication', () => {
		const bad = files.filter(f => {
			const relPath = rel(f);
			if (publicRoutes.has(relPath)) return false;
			const content = read(f);
			// Match only the verb handler arrays in the default export (e.g. `get: [...] as const`)
			const verbArrays = [...content.matchAll(/\b(?:get|post|put|delete|patch)\s*:\s*\[([\s\S]*?)\]\s*as const/g)].map(m =>
				String(m[1]),
			);
			if (verbArrays.length === 0) return false;
			return verbArrays.some(arr => !/requireAuthentication/.test(arr));
		});
		expect(bad.map(rel), 'API handler missing requireAuthentication').toStrictEqual([]);
	});

	it('all authenticated API handlers include requirePermissions', () => {
		const bad = files.filter(f => {
			const relPath = rel(f);
			if (publicRoutes.has(relPath)) return false;
			const content = read(f);
			const verbArrays = [...content.matchAll(/\b(?:get|post|put|delete|patch)\s*:\s*\[([\s\S]*?)\]\s*as const/g)].map(m =>
				String(m[1]),
			);
			if (verbArrays.length === 0) return false;
			return verbArrays.some(arr => !/requirePermissions/.test(arr));
		});
		expect(bad.map(rel), 'API handler missing requirePermissions').toStrictEqual([]);
	});
});

// ─── Pages ────────────────────────────────────────────────────────────────────

describe('pages', () => {
	const files = getFiles('pages', SKIP);

	it('no page file imports requestInfo as a value', () => {
		const bad = files.filter(p => /^import(?!\s+type)\s*\{[^}]*\brequestInfo\b/m.test(read(p)));
		expect(bad.map(rel), 'requestInfo global must not be imported; destructure from function parameter instead').toStrictEqual(
			[],
		);
	});

	it('all page component files export a default function with a Pages__ prefix', () => {
		// Not-found is a framework utility, not a page component in the product sense
		const exceptions = new Set(['pages/not-found.tsx']);
		const pageFiles = files.filter(p => p.endsWith('.tsx') && !p.endsWith('_routes.tsx'));
		const bad: string[] = [];
		for (const p of pageFiles) {
			const relPath = rel(p);
			if (exceptions.has(relPath)) continue;
			const content = read(p);
			const match = content.match(/^export default (?:async )?function (\w+)/m);
			if (!match) {
				bad.push(`${relPath} — no "export default [async] function <name>" found`);
				continue;
			}
			if (!match[1].startsWith('Pages__')) {
				bad.push(`${relPath} — function is named "${match[1]}", must start with "Pages__"`);
			}
		}
		expect(bad, 'Page component default export must be a function named with the Pages__ prefix').toStrictEqual([]);
	});

	it('all page routes files export a named document-type map, not a bare array', () => {
		const routeFiles = files.filter(p => p.endsWith('_routes.ts') || p.endsWith('_routes.tsx'));
		const bad: string[] = [];
		for (const p of routeFiles) {
			const content = read(p);
			const relPath = rel(p);
			if (!/^export default \{/m.test(content)) {
				bad.push(`${relPath} — must use export default { docType: [...] }, not a bare array or single handler`);
			}
		}
		expect(bad, 'routes files must use export default { docType: [...] }').toStrictEqual([]);
	});

	it('all page routes include requirePermissions', () => {
		// Dev routes are intentionally unprotected (only mounted in DEV mode)
		// Auth login route is a public entry point for the login flow
		const exceptions: Record<string, Record<string, { perms?: boolean }>> = {
			'pages/dev/_routes.tsx': { '/topic/:subdomain': { perms: true } },
			'pages/auth/_routes.ts': { '/login': { perms: true } },
		};
		const routeFiles = files.filter(p => p.endsWith('_routes.ts') || p.endsWith('_routes.tsx'));
		const bad: string[] = [];
		for (const p of routeFiles) {
			const content = read(p);
			const relPath = rel(p);
			const fileExceptions = exceptions[relPath] ?? {};

			[...content.matchAll(/\broute\((['"][^'"]*['"]),\s*\[([\s\S]*?)\]/g)].forEach(m => {
				const routePath = m[1].slice(1, -1);
				const ex = fileExceptions[routePath] ?? {};
				if (!m[2].includes('requirePermissions') && !ex.perms) {
					bad.push(`${relPath}: route('${routePath}') — missing requirePermissions`);
				}
			});
		}
		expect(bad, 'All page routes must include requirePermissions').toStrictEqual([]);
	});
});

// ─── Components ───────────────────────────────────────────────────────────────

describe('components', () => {
	const files = getFiles('components', SKIP);

	it('no component file imports from @/repositories', () => {
		// TODO: site-header fetches topics directly — should receive them as props from pages
		const exceptions = new Set(['components/nav/site-header.tsx']);
		const bad = files.filter(p => !exceptions.has(rel(p)) && /from ['"]@\/repositories['"/]/.test(read(p)));
		expect(bad.map(rel), 'Repository imports not allowed in components; pass data as props').toStrictEqual([]);
	});

	it('no component file imports from @/models', () => {
		const bad = files.filter(p => /from ['"]@\/models['"/]/.test(read(p)));
		expect(bad.map(rel), 'Direct @/models import not allowed in components').toStrictEqual([]);
	});
});

// ─── Schemas ──────────────────────────────────────────────────────────────────

describe('schemas', () => {
	const files = getFiles('schemas', [...SKIP, 'index.ts', 'utils.ts']);

	it('no schema file imports from @/models', () => {
		const bad = files.filter(p => /from ['"]@\/models['"/]/.test(read(p)));
		expect(bad.map(rel), 'Direct @/models import not allowed in schemas').toStrictEqual([]);
	});
});

// ─── Interrupters ─────────────────────────────────────────────────────────────

describe('interrupters', () => {
	const files = getFiles('interrupters', [...SKIP, 'index.ts']);

	it('no interrupter file uses export default', () => {
		const bad = files.filter(p => /\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'export default not allowed in interrupters; use named exports re-exported via index.ts').toStrictEqual(
			[],
		);
	});
});

// ─── Middleware ────────────────────────────────────────────────────────────────

describe('middleware', () => {
	const files = getFiles('middleware', SKIP);

	it('every middleware file has a default export', () => {
		const bad = files.filter(p => !/\bexport default\b/.test(read(p)));
		expect(bad.map(rel), 'Middleware files must use default export').toStrictEqual([]);
	});
});

// ─── Worker ───────────────────────────────────────────────────────────────────

describe('worker', () => {
	it('top-level route() calls are only for root, about, and NotFound', () => {
		const content = read(join(SRC, 'worker.tsx'));
		// Match route() calls inside render() — these are the top-level page routes
		const renderBlock = content.match(/render\([^,]+,\s*\[([\s\S]*?)\]\s*\)/)?.[1] ?? '';
		const routes = [...renderBlock.matchAll(/\broute\('([^']+)'/g)].map(m => m[1]);
		expect(routes.sort(), 'Unexpected route() calls in worker.tsx render block — use prefix() for sub-routes').toEqual([
			'*',
			'/',
			'/about',
		]);
	});

	it('all page imports come from _routes files, root, about, or not-found', () => {
		const content = read(join(SRC, 'worker.tsx'));
		const allowedExceptions = ['home', 'about', 'not-found'];
		const bad = [...content.matchAll(/from ['"]@\/pages\/([^'"]+)['"]/g)]
			.map(m => m[1])
			.filter(p => !p.endsWith('/_routes') && !allowedExceptions.includes(p));
		expect(bad, 'Page imports in worker.tsx must come from */_routes files').toStrictEqual([]);
	});
});

// ─── Barrel exports ───────────────────────────────────────────────────────────

describe('barrel exports', () => {
	it('src/actions has no index.ts (barrel exports break the RSC build)', () => {
		expect(existsSync(join(SRC, 'actions/index.ts'))).toBe(false);
	});

	it.each(['repositories', 'schemas'])('src/%s has an index.ts barrel file', dir => {
		expect(existsSync(join(SRC, `${dir}/index.ts`))).toBe(true);
	});

	const allSource = getFiles('.', SKIP);

	it('no source file (outside repositories/) uses a @/repositories sub-path import', () => {
		// Files within repositories/ legitimately import from sibling sub-modules (e.g. pds/ importing d1/ functions)
		// and from repositories/errors.ts — those are exempt.
		const bad = allSource.filter(p => !p.includes('/repositories/') && /from ['"]@\/repositories\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/repositories barrel, not sub-paths').toStrictEqual([]);
	});

	it('no source file uses a @/schemas sub-path import', () => {
		const bad = allSource.filter(p => /from ['"]@\/schemas\//.test(read(p)));
		expect(bad.map(rel), 'Import from @/schemas barrel, not sub-paths').toStrictEqual([]);
	});
});
