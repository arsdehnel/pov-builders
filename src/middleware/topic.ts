import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { d1 } from '@/repositories';

export default async function topicMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): Promise<void> {
	let subdomain: string | undefined;
	if (import.meta.env.DEV) {
		// In dev, topic is controlled via /dev/topic/:subdomain and stored on globalThis.
		subdomain = (globalThis as { __devTopic?: string }).__devTopic ?? 'ai';
	} else {
		const hostname = new URL(request.url).hostname;
		subdomain = hostname.split('.')[0];
	}

	if (subdomain) {
		try {
			ctx.topic = await d1.getTopicBySubdomain(subdomain, ctx.logger);
		} catch {
			ctx.logger.warn(`Topic ${subdomain} failed to be retrieved`);
		}
	}
}
