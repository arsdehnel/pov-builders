import { AtUri } from '@atproto/syntax';
import { MissingAtpRecordError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { getTopicById } from '@/repositories/d1';
import type { StanceDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncStanceAtpRecord(stance: StanceDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	const topic = await getTopicById(stance.topicId, logger);

	if (!topic.atpUri || !topic.atpCid) {
		throw new MissingAtpRecordError('topic', stance.topicId);
	}

	const client = await getServicePdsClient();

	const record = {
		$type: 'builders.pov.stance' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		slug: stance.slug,
		label: stance.label,
		description: stance.description,
		order: stance.order,
		createdAt: stance.createdAt,
	};

	if (stance.atpUri) {
		const response = await client.putRecord(record, new AtUri(stance.atpUri).rkey);
		logger.info(`Updated stance PDS record ${stance.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	}

	const response = await client.createRecord(record);
	logger.info(`Created stance PDS record ${stance.id}: ${response.body.uri}`);
	return { uri: response.body.uri, cid: response.body.cid };
}
