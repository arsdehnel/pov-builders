import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { clearSession, loadSessionFromRequest } from 'rwsdk-atp/browser-sessions';
import { getOAuthClient } from 'rwsdk-atp/oauth';

async function post({ request, response }: RequestInfo): Promise<Response> {
	const session = await loadSessionFromRequest(env, request, response.headers);
	if (session?.did) {
		const client = await getOAuthClient(env);
		await client.revoke(session.did);
	}

	await clearSession(env, request, response.headers);
	response.headers.set('Location', '/');
	return new Response(null, { status: 302, headers: response.headers });
}

export default { post };
