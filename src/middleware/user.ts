import { env } from 'cloudflare:workers';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { clearSession } from 'rwsdk-atp/browser-sessions';
import { d1 } from '@/repositories';

export default async function userMiddleware({
	ctx,
	request,
	response,
}: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	if (ctx.session?.userId) {
		try {
			ctx.user = await d1.getUserById(ctx.session.userId, ctx.logger);
			ctx.logger = ctx.logger.child({ userId: ctx.user.id });
		} catch (err) {
			ctx.logger.error(`Error fetching current user: ${err}`);
			await clearSession(env, request, response.headers);
			response.headers.set('Location', '/');

			return new Response(null, {
				status: 302,
				headers: response.headers,
			});
		}
	}
}
