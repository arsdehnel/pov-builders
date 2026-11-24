import { AtUri } from '@atproto/syntax';
import type { Logger } from 'rwsdk-atp/logger';
import type { TopicDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncTopicAtpRecord(topic: TopicDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	const client = await getServicePdsClient();

	const record = {
		$type: 'builders.pov.topic' as const,
		subdomain: topic.subdomain,
		title: topic.title,
		createdAt: topic.createdAt,
		...(topic.updatedAt ? { updatedAt: topic.updatedAt } : {}),
	};

	if (topic.atpUri) {
		const response = await client.putRecord(record, new AtUri(topic.atpUri).rkey);
		logger.info(`Updated topic PDS record ${topic.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	}

	const response = await client.createRecord(record);
	logger.info(`Created topic PDS record ${topic.id}: ${response.body.uri}`);
	return { uri: response.body.uri, cid: response.body.cid };
}
