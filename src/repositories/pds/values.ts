import { MissingAtpRecordError, RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { AtUri } from '@atproto/syntax';
import { getTopicById } from '@/repositories/d1';
import { AtpOperationError } from '@/repositories/errors';
import type { ValueDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncValueAtpRecord(value: ValueDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	logger.debug(`Syncing ATP record for value ${value.id}`);

	const topic = await getTopicById(value.topicId, logger);

	if (!topic.atpUri || !topic.atpCid) {
		logger.warn(`Cannot sync value ${value.id}: topic ${value.topicId} has no ATP record`);
		throw new MissingAtpRecordError('topic', value.topicId);
	}

	const record = {
		$type: 'builders.pov.value' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		slug: value.slug,
		label: value.label,
		description: value.description,
		order: value.order,
		createdAt: value.createdAt,
	};

	try {
		const client = await getServicePdsClient();

		if (value.atpUri) {
			const response = await client.putRecord(record, new AtUri(value.atpUri).rkey);
			logger.info(`Updated value PDS record ${value.id}: ${response.body.uri}`);
			return { uri: response.body.uri, cid: response.body.cid };
		}

		const response = await client.createRecord(record);
		logger.info(`Created value PDS record ${value.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error syncing ATP record for value ${value.id}`, { error: err });
		throw new AtpOperationError(`syncing ATP record for value ${value.id}`, err);
	}
}
