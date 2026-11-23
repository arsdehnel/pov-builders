import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Logger } from 'rwsdk-atp/logger';
import db from '@/db';
import { positionValues } from '@/models';
import type { PositionValueDBRead } from '@/types';

export async function upsertPositionValue(
	data: { positionId: string; valueId: string; stanceId: string },
	actingUserId: string,
	logger: Logger,
): Promise<PositionValueDBRead> {
	logger.debug(`Upserting position value for position ${data.positionId} value ${data.valueId}`);

	const [result] = await db
		.insert(positionValues)
		.values({
			positionId: data.positionId,
			valueId: data.valueId,
			stanceId: data.stanceId,
			createdBy: actingUserId,
		})
		.onConflictDoUpdate({
			target: [positionValues.positionId, positionValues.valueId],
			set: {
				stanceId: data.stanceId,
				updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
				updatedBy: actingUserId,
			},
		})
		.returning();

	logger.info(`Upserted position value ${result.id}`);
	return result;
}

export async function getPositionValuesByPositionId(positionId: string, logger: Logger): Promise<PositionValueDBRead[]> {
	logger.debug(`Fetching position values for position ${positionId}`);
	return db
		.select()
		.from(positionValues)
		.where(and(eq(positionValues.positionId, positionId), isNull(positionValues.deletedAt)));
}
