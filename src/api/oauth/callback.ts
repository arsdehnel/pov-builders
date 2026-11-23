import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { getOAuthClient, type OAuthSession } from 'rwsdk-atp/auth';
import { saveSession } from 'rwsdk-atp/browser-sessions';
import { upsertUser } from '@/repositories';

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

	let handle: string | null = null;
	try {
		const issuer = session.serverMetadata.issuer.startsWith('http')
			? session.serverMetadata.issuer
			: `https://${session.serverMetadata.issuer}`;
		const describeRes = await fetch(`${issuer}/xrpc/com.atproto.repo.describeRepo?repo=${session.did}`);
		if (describeRes.ok) {
			const describeData = (await describeRes.json()) as { handle?: string };
			handle = describeData.handle ?? null;
		} else {
			ctx.logger.warn(`describeRepo returned ${describeRes.status} for ${session.did}`);
		}
	} catch (err) {
		ctx.logger.warn(`Could not fetch handle for ${session.did}: ${err}`);
	}

	const savedUser = await upsertUser(session.did, handle, null, ctx.logger);
	ctx.logger.info(`Upserted user for did: ${session.did}`);

	await saveSession(env, request.url, null, response.headers, { did: session.did, userId: savedUser.id });
	ctx.logger.info(`Saved session for did: ${session.did}`);

	response.headers.set('Location', '/');
	return new Response(null, { status: 302, headers: response.headers });
}

export default {
	get,
};
