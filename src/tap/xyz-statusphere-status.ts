import type { Logger } from 'rwsdk-atp/logger';
import { type RecordEvent, TapRegistrationQueueConsumer } from 'rwsdk-atp/tap';
import { upsertUser } from '@/repositories';

async function queueConsumer(msg: RecordEvent, ctx: { logger: Logger }): Promise<void> {
	ctx.logger.info(`Process statusphere queue message: ${JSON.stringify(msg)}`);
	try {
		await upsertUser(msg.did, null, null, ctx.logger);
	} catch (err) {
		ctx.logger.error(`Error consuming from queue: ${err}`);
	}
}

export default new TapRegistrationQueueConsumer({
	collection: 'xyz.statusphere.status',
	actions: ['create', 'update'],
	queueConsumer,
});
