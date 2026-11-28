import { env } from 'cloudflare:workers';
import { getOAuthClient } from '@arsdehnel/rwsdk-atp/auth';
import { clearSession, loadSessionFromRequest } from '@arsdehnel/rwsdk-atp/browser-sessions';
import type { RequestInfo } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';

async function _postHandler({ request, response }: RequestInfo): Promise<Response> {
	const session = await loadSessionFromRequest(env, request, response.headers);
	if (session?.did) {
		const client = await getOAuthClient(env);
		await client.revoke(session.did);
	}

	await clearSession(env, request, response.headers);
	response.headers.set('Location', '/');
	return new Response(null, { status: 302, headers: response.headers });
}

export default { post: [requireAuthentication, requirePermissions('auth:logout'), _postHandler] as const };
