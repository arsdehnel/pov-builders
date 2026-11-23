import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Logger } from 'rwsdk-atp/logger';
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

export async function getPositionByUserIdAndTopicId(
	userId: string,
	topicId: string,
	logger: Logger,
): Promise<PositionDBRead | undefined> {
	logger.debug(`Fetching position for user ${userId} topic ${topicId}`);
	const results = await db
		.select()
		.from(positions)
		.where(and(eq(positions.userId, userId), eq(positions.topicId, topicId), isNull(positions.deletedAt)));
	return results[0];
}
