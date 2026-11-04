import { env } from 'cloudflare:workers';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { loadSessionFromRequest } from 'rwsdk-atp/browser-sessions';

export default async function sessionMiddleware({ ctx, request, response }: RequestInfo<DefaultAppContext>): Promise<void> {
	try {
		ctx.logger.info(`Loading session from request: ${request.url}`);
		ctx.session = await loadSessionFromRequest(env, request, response.headers);
		ctx.logger.info(`Session loaded: ${JSON.stringify(ctx.session)}`);
	} catch (error) {
		ctx.logger.error(`Uncaught session loading error: ${JSON.stringify(error)}`);
	}
}
