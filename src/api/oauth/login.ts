import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { getOAuthClient } from 'rwsdk-atp/oauth';

async function post({ request }: RequestInfo): Promise<Response> {
	const { handle } = (await request.json()) as { handle?: string };

	if (!handle) {
		return Response.json({ error: 'Handle is required' }, { status: 400 });
	}

	const client = await getOAuthClient(env);
	const authUrl = await client.authorize(handle, { scope: env.ATPROTO_OAUTH_SCOPE });
	return Response.json({ redirectUrl: authUrl.toString() });
}

export default { post };
