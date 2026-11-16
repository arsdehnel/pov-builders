import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { getTopicBySubdomain } from '@/repositories';

export default async function topicMiddleware({ ctx }: RequestInfo<DefaultAppContext>): Promise<void> {
	ctx.topic = await getTopicBySubdomain('ai', ctx.logger);
}
