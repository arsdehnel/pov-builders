import { AtUri } from '@atproto/syntax';
import { MissingAtpRecordError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { getStancesByTopicId, getTopicById, getValuesByTopicId } from '@/repositories/d1';
import type { PositionDBRead, PositionValueDBRead } from '@/types';
import { getUserPdsClient } from './clients';

export async function syncPositionAtpRecord(
	position: PositionDBRead,
	positionValues: PositionValueDBRead[],
	did: string,
	logger: Logger,
): Promise<{ uri: string; cid: string }> {
	const [topic, allStances, allValues] = await Promise.all([
		getTopicById(position.topicId, logger),
		getStancesByTopicId(position.topicId, logger),
		getValuesByTopicId(position.topicId, logger),
	]);

	if (!topic.atpUri || !topic.atpCid) {
		throw new MissingAtpRecordError('topic', position.topicId);
	}

	const stanceMap = new Map(allStances.map(s => [s.id, s]));
	const valueMap = new Map(allValues.map(v => [v.id, v]));

	const overallStance = stanceMap.get(position.overallStanceId);
	if (!overallStance?.atpUri || !overallStance?.atpCid) {
		throw new MissingAtpRecordError('stance', position.overallStanceId);
	}

	const valueStances = positionValues.flatMap(pv => {
		const value = valueMap.get(pv.valueId);
		const stance = stanceMap.get(pv.stanceId);
		if (!value?.atpUri || !value?.atpCid || !stance?.atpUri || !stance?.atpCid) {
			logger.warn(`Skipping position value ${pv.id}: missing ATP record for value or stance`);
			return [];
		}
		return [{ value: { uri: value.atpUri, cid: value.atpCid }, stance: { uri: stance.atpUri, cid: stance.atpCid } }];
	});

	const record = {
		$type: 'dev.stance-build.position' as const,
		topic: { uri: topic.atpUri, cid: topic.atpCid },
		overallStance: { uri: overallStance.atpUri, cid: overallStance.atpCid },
		valueStances,
		createdAt: position.createdAt,
	};

	const client = await getUserPdsClient(did);

	if (position.atpUri) {
		const response = await client.putRecord(record, new AtUri(position.atpUri).rkey);
		logger.info(`Updated position PDS record ${position.id}: ${response.body.uri}`);
		return { uri: response.body.uri, cid: response.body.cid };
	}

	const response = await client.createRecord(record);
	logger.info(`Created position PDS record ${position.id}: ${response.body.uri}`);
	return { uri: response.body.uri, cid: response.body.cid };
}
