import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { views } from '@/models';
import type { ViewDBRead } from '@/types';

export async function upsertView(
	data: { topicId: string; overallStanceId: string },
	actingUserId: string,
	logger: Logger,
): Promise<ViewDBRead> {
	logger.debug(`Upserting view for user ${actingUserId} topic ${data.topicId}`);

	const [result] = await db
		.insert(views)
		.values({
			userId: actingUserId,
			topicId: data.topicId,
			label: 'Default',
			overallStanceId: data.overallStanceId,
			createdBy: actingUserId,
		})
		.onConflictDoUpdate({
			target: [views.userId, views.topicId, views.label],
			set: {
				overallStanceId: data.overallStanceId,
				updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
				updatedBy: actingUserId,
			},
		})
		.returning();

	logger.info(`Upserted view ${result.id}`);
	return result;
}

export async function setViewAtpRecord(id: string, atpUri: string, atpCid: string, logger: Logger): Promise<ViewDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'View');
	}
	logger.debug(`Setting ATP record for view ${id}`);
	const updated = await db
		.update(views)
		.set({ atpUri, atpCid })
		.where(and(eq(views.id, id), isNull(views.deletedAt)))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('View');
	}

	logger.info(`Set ATP record for view ${id}: ${atpUri}`);
	return updated[0];
}

export async function getViewByUserIdAndTopicId(userId: string, topicId: string, logger: Logger): Promise<ViewDBRead> {
	logger.debug(`Fetching view for user ${userId} topic ${topicId}`);
	const results = await db
		.select()
		.from(views)
		.where(and(eq(views.userId, userId), eq(views.topicId, topicId), isNull(views.deletedAt)));

	if (results.length === 0) {
		throw new NoRecordFoundError('View');
	}
	if (results.length !== 1) {
		throw new TooManyRecordsFoundError('View', results.length, 1);
	}

	return results[0];
}
