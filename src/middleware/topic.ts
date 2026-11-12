import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

export default async function topicMiddleware({ ctx }: RequestInfo<DefaultAppContext>): Promise<void> {
	ctx.topic = 'ai';
}
