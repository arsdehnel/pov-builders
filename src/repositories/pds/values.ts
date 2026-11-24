import { AtUri } from '@atproto/syntax';
import { MissingAtpRecordError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { getTopicById } from '@/repositories/d1';
import type { ValueDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncValueAtpRecord(value: ValueDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	const topic = await getTopicById(value.topicId, logger);

	if (!topic.atpUri || !topic.atpCid) {
		throw new MissingAtpRecordError('topic', value.topicId);
	}

	const client = await getServicePdsClient();

	const record = {
		$type: 'dev.stance-build.value' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		slug: value.slug,
		label: value.label,
		description: value.description,
		order: value.order,
		createdAt: value.createdAt,
	};

	if (value.atpUri) {
		const response = await client.putRecord(record, new AtUri(value.atpUri).rkey);
		logger.info(`Updated value PDS record ${value.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	}

	const response = await client.createRecord(record);
	logger.info(`Created value PDS record ${value.id}: ${response.body.uri}`);
	return { uri: response.body.uri, cid: response.body.cid };
}
