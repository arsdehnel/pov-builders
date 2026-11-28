import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { viewValues } from '@/models';
import type { ViewValueDBRead } from '@/types';

export async function upsertViewValue(
	data: { viewId: string; valueId: string; stanceId: string },
	actingUserId: string,
	logger: Logger,
): Promise<ViewValueDBRead> {
	logger.debug(`Upserting view value for view ${data.viewId} value ${data.valueId}`);

	const [result] = await db
		.insert(viewValues)
		.values({
			viewId: data.viewId,
			valueId: data.valueId,
			stanceId: data.stanceId,
			createdBy: actingUserId,
		})
		.onConflictDoUpdate({
			target: [viewValues.viewId, viewValues.valueId],
			set: {
				stanceId: data.stanceId,
				updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
				updatedBy: actingUserId,
			},
		})
		.returning();

	logger.info(`Upserted view value ${result.id}`);
	return result;
}

export async function getViewValuesByViewId(viewId: string, logger: Logger): Promise<ViewValueDBRead[]> {
	logger.debug(`Fetching view values for view ${viewId}`);
	return db
		.select()
		.from(viewValues)
		.where(and(eq(viewValues.viewId, viewId), isNull(viewValues.deletedAt)));
}
