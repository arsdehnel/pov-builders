import { cloudflare } from '@cloudflare/vite-plugin';
import { redwood } from 'rwsdk/vite';
import { rwsdkAtp } from 'rwsdk-atp/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		// Bind to 127.0.0.1 so the OAuth redirect URI (http://127.0.0.1:5173/oauth/callback)
		// matches the address the dev server is actually listening on.
		host: '127.0.0.1',
		// Allow the Tap Docker container to reach the dev server via host.docker.internal.
		// Without this, Vite blocks requests whose Host header doesn't match the bound address.
		allowedHosts: ['host.docker.internal'],
	},
	plugins: [
		rwsdkAtp(),
		cloudflare({
			viteEnvironment: { name: 'worker' },
		}),
		redwood(),
	],
});
