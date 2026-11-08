import type { Logger } from 'rwsdk-atp/logger';
import { type RecordEvent, TapRegistrationQueueConsumer } from 'rwsdk-atp/tap';

async function queueConsumer(msg: RecordEvent, ctx: { logger: Logger }): Promise<void> {
	ctx.logger.info(`Process statusphere queue message: ${JSON.stringify(msg)}`);
}

export default new TapRegistrationQueueConsumer({
	collection: 'xyz.statusphere.status',
	actions: ['create', 'update'],
	queueConsumer,
});
