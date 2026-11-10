import { env } from 'cloudflare:workers';
import { DidResolver } from '@atproto/identity';
import type { Logger } from 'rwsdk-atp/logger';
import { type RecordEvent, TapRegistrationQueueConsumer } from 'rwsdk-atp/tap';
import { getUserHandle, upsertUser } from '@/repositories';

const didres = new DidResolver({ plcUrl: env.ATPROTO_PLC_URL, fetch: globalThis.fetch });

async function queueConsumer(msg: RecordEvent, ctx: { logger: Logger }): Promise<void> {
	ctx.logger.info(`Process statusphere queue message: ${JSON.stringify(msg)}`);
	try {
		let handle = await getUserHandle(msg.did);
		if (!handle) {
			ctx.logger.info(`No local handle found, resolving did via ATP`);
			const dataAtpData = await didres.resolveAtprotoData(msg.did);
			handle = dataAtpData.handle;
		}
		await upsertUser(msg.did, handle, null, ctx.logger);
	} catch (err) {
		ctx.logger.error(`Error consuming from queue: ${err}`);
	}
}

export default new TapRegistrationQueueConsumer({
	collection: 'xyz.statusphere.status',
	actions: ['create', 'update'],
	queueConsumer,
});
