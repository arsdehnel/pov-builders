import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { positions } from '@/models';
import type { PositionDBRead } from '@/types';

export async function upsertPosition(
	data: { topicId: string; overallStanceId: string },
	actingUserId: string,
	logger: Logger,
): Promise<PositionDBRead> {
	logger.debug(`Upserting position for user ${actingUserId} topic ${data.topicId}`);

	const [result] = await db
		.insert(positions)
		.values({
			userId: actingUserId,
			topicId: data.topicId,
			label: 'Default',
			overallStanceId: data.overallStanceId,
			createdBy: actingUserId,
		})
		.onConflictDoUpdate({
			target: [positions.userId, positions.topicId, positions.label],
			set: {
				overallStanceId: data.overallStanceId,
				updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
				updatedBy: actingUserId,
			},
		})
		.returning();

	logger.info(`Upserted position ${result.id}`);
	return result;
}

export async function setPositionAtpRecord(id: string, atpUri: string, atpCid: string, logger: Logger): Promise<PositionDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Position');
	}
	logger.debug(`Setting ATP record for position ${id}`);
	const updated = await db
		.update(positions)
		.set({ atpUri, atpCid })
		.where(and(eq(positions.id, id), isNull(positions.deletedAt)))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('Position');
	}

	logger.info(`Set ATP record for position ${id}: ${atpUri}`);
	return updated[0];
}

export async function getPositionByUserIdAndTopicId(userId: string, topicId: string, logger: Logger): Promise<PositionDBRead> {
	logger.debug(`Fetching position for user ${userId} topic ${topicId}`);
	const results = await db
		.select()
		.from(positions)
		.where(and(eq(positions.userId, userId), eq(positions.topicId, topicId), isNull(positions.deletedAt)));

	if (results.length === 0) {
		throw new NoRecordFoundError('Position');
	}
	if (results.length !== 1) {
		throw new TooManyRecordsFoundError('Position', results.length, 1);
	}

	return results[0];
}
