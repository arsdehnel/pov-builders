import { readdirSync, statSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
let localDbUrl: string | undefined;
try {
	const file = readdirSync(d1Dir)
		.filter(f => f.endsWith('.sqlite'))
		.sort((a, b) => statSync(`${d1Dir}/${b}`).size - statSync(`${d1Dir}/${a}`).size)
		.at(0);
	if (file) localDbUrl = `${d1Dir}/${file}`;
} catch {
	// .wrangler not created yet — `wrangler dev` must run first
}

export default defineConfig({
	schema: './src/models/index.ts',
	out: './drizzle',
	dialect: 'sqlite',
	...(localDbUrl ? { dbCredentials: { url: localDbUrl } } : {}),
});
