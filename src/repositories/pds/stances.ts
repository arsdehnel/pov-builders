import { MissingAtpRecordError, RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { AtUri } from '@atproto/syntax';
import { getTopicById } from '@/repositories/d1';
import { AtpOperationError } from '@/repositories/errors';
import type { StanceDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncStanceAtpRecord(stance: StanceDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	logger.debug(`Syncing ATP record for stance ${stance.id}`);

	const topic = await getTopicById(stance.topicId, logger);

	if (!topic.atpUri || !topic.atpCid) {
		logger.warn(`Cannot sync stance ${stance.id}: topic ${stance.topicId} has no ATP record`);
		throw new MissingAtpRecordError('topic', stance.topicId);
	}

	const record = {
		$type: 'builders.pov.stance' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		slug: stance.slug,
		label: stance.label,
		description: stance.description,
		order: stance.order,
		createdAt: stance.createdAt,
	};

	try {
		const client = await getServicePdsClient();

		if (stance.atpUri) {
			const response = await client.putRecord(record, new AtUri(stance.atpUri).rkey);
			logger.info(`Updated stance PDS record ${stance.id}: ${response.body.uri}`);
			return { uri: response.body.uri, cid: response.body.cid };
		}

		const response = await client.createRecord(record);
		logger.info(`Created stance PDS record ${stance.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error syncing ATP record for stance ${stance.id}`, { error: err });
		throw new AtpOperationError(`syncing ATP record for stance ${stance.id}`, err);
	}
}
