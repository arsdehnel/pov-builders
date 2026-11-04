import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { saveSession } from 'rwsdk-atp/browser-sessions';
import { getOAuthClient, type OAuthSession } from 'rwsdk-atp/oauth';

async function get({ ctx, request, response }: RequestInfo): Promise<Response> {
	const client = await getOAuthClient(env);
	let session: OAuthSession | undefined;
	try {
		({ session } = await client.callback(new URL(request.url).searchParams));
	} catch {
		ctx.logger.error('OAuth callback failed, redirecting to login to try again');
		response.headers.set('Location', '/api/oauth/login');
		return new Response(null, { status: 302, headers: response.headers });
	}

	await saveSession(env, request.url, null, response.headers, { did: session.did });
	ctx.logger.info(`Saved session for did: ${session.did}`);
	response.headers.set('Location', '/');
	return new Response(null, { status: 302, headers: response.headers });
}

export default {
	get,
};
