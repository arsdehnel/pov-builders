import { MissingAtpRecordError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { AtUri } from '@atproto/syntax';
import { getStancesByTopicId, getTopicById, getValuesByTopicId } from '@/repositories/d1';
import type { ViewDBRead, ViewValueDBRead } from '@/types';
import { getUserPdsClient } from './clients';

export async function syncViewAtpRecord(
	view: ViewDBRead,
	viewValues: ViewValueDBRead[],
	did: string,
	logger: Logger,
): Promise<{ uri: string; cid: string }> {
	const [topic, allStances, allValues] = await Promise.all([
		getTopicById(view.topicId, logger),
		getStancesByTopicId(view.topicId, logger),
		getValuesByTopicId(view.topicId, logger),
	]);

	if (!topic.atpUri || !topic.atpCid) {
		throw new MissingAtpRecordError('topic', view.topicId);
	}

	const stanceMap = new Map(allStances.map(s => [s.id, s]));
	const valueMap = new Map(allValues.map(v => [v.id, v]));

	const overallStance = stanceMap.get(view.overallStanceId);
	if (!overallStance?.atpUri || !overallStance?.atpCid) {
		throw new MissingAtpRecordError('stance', view.overallStanceId);
	}

	const valueStances = viewValues.flatMap(vv => {
		const value = valueMap.get(vv.valueId);
		const stance = stanceMap.get(vv.stanceId);
		if (!value?.atpUri || !value?.atpCid || !stance?.atpUri || !stance?.atpCid) {
			logger.warn(`Skipping view value ${vv.id}: missing ATP record for value or stance`);
			return [];
		}
		return [{ value: { uri: value.atpUri, cid: value.atpCid }, stance: { uri: stance.atpUri, cid: stance.atpCid } }];
	});

	const record = {
		$type: 'builders.pov.view' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		overallStance: { uri: overallStance.atpUri, cid: overallStance.atpCid },
		valueStances,
		createdAt: view.createdAt,
	};

	const client = await getUserPdsClient(did);

	if (view.atpUri) {
		const response = await client.putRecord(record, new AtUri(view.atpUri).rkey);
		logger.info(`Updated view PDS record ${view.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	}

	const response = await client.createRecord(record);
	logger.info(`Created view PDS record ${view.id}: ${response.body.uri}`);
	return { uri: response.body.uri, cid: response.body.cid };
}
