import { env } from 'cloudflare:workers';
import { getOAuthClient } from '@arsdehnel/rwsdk-atp/auth';
import type { RequestInfo } from 'rwsdk/worker';

async function post({ ctx, request }: RequestInfo): Promise<Response> {
	const { handle } = (await request.json()) as { handle?: string };

	if (!handle) {
		return Response.json({ error: 'Handle is required' }, { status: 400 });
	}

	const client = await getOAuthClient(env);
	try {
		const authUrl = await client.authorize(handle, { scope: env.ATPROTO_OAUTH_SCOPE });
		return Response.json({ redirectUrl: authUrl.toString() });
	} catch (err) {
		const message = err instanceof Error ? (err.cause ? err.cause : err.message) : String(err);
		ctx.logger.error(`[oauth-login] authorize failed for "${handle}": ${message}`);
		const stack = err instanceof Error ? err.stack : '';
		ctx.logger.error(stack ?? '');
		return Response.json(
			{
				error: "Handle not found. Make sure you're using a handle on this PDS.",
			},
			{ status: 400 },
		);
	}
}

export default { post };
