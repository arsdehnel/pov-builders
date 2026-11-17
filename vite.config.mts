import { cloudflare } from '@cloudflare/vite-plugin';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { redwood } from 'rwsdk/vite';
import { rwsdkAtp } from 'rwsdk-atp/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	css: {
		modules: {
			localsConvention: 'camelCase',
		},
	},
	server: {
		// Bind to 127.0.0.1 so the OAuth redirect URI (http://127.0.0.1:5173/oauth/callback)
		// matches the address the dev server is actually listening on.
		host: '127.0.0.1',
		// Allow the Tap Docker container to reach the dev server via host.docker.internal.
		// Without this, Vite blocks requests whose Host header doesn't match the bound address.
		allowedHosts: ['host.docker.internal'],
	},
	plugins: [
		mdx({
			remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
		}),
		rwsdkAtp(),
		cloudflare({
			viteEnvironment: { name: 'worker' },
		}),
		redwood(),
	],
});
