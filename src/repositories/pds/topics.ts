import { RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { AtUri } from '@atproto/syntax';
import { AtpOperationError } from '@/repositories/errors';
import type { TopicDBRead } from '@/types';
import { getServicePdsClient } from './clients';

export async function syncTopicAtpRecord(topic: TopicDBRead, logger: Logger): Promise<{ uri: string; cid: string }> {
	logger.debug(`Syncing ATP record for topic ${topic.id}`);

	const record = {
		$type: 'builders.pov.topic' as const,
		subdomain: topic.subdomain,
		title: topic.title,
		createdAt: topic.createdAt,
		...(topic.updatedAt ? { updatedAt: topic.updatedAt } : {}),
	};

	try {
		const client = await getServicePdsClient();

		if (topic.atpUri) {
			const response = await client.putRecord(record, new AtUri(topic.atpUri).rkey);
			logger.info(`Updated topic PDS record ${topic.id}: ${response.body.uri}`);
			return { uri: response.body.uri, cid: response.body.cid };
		}

		const response = await client.createRecord(record);
		logger.info(`Created topic PDS record ${topic.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error syncing ATP record for topic ${topic.id}`, { error: err });
		throw new AtpOperationError(`syncing ATP record for topic ${topic.id}`, err);
	}
}
