import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { tapWebhookHandler } from 'rwsdk-atp/tap';
import tapRegistrations from '@/tap/registrations';

async function post({ ctx, request }: RequestInfo): Promise<Response> {
	try {
		return await tapWebhookHandler(request, tapRegistrations, env.QUEUE_TAP_WEBHOOK, ctx.logger);
	} catch (err) {
		ctx.logger.error(`Error processing tap webhook: ${err}`);
		return Response.json(
			{
				error: `Error processing tap webhook: ${err}`,
			},
			{ status: 400 },
		);
	}
}
export default {
	post,
};
