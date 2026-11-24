'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { NoRecordFoundError } from 'rwsdk-atp/errors';
import { type ActionState, actionErrorResponse, actionSuccessResponse } from 'rwsdk-atp/response';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import type { PositionDBRead, PositionValueDBRead } from '@/types';

export const savePositionValue = serverAction([
	requireAuthentication,
	requirePermissions('positions:update'),
	_savePositionValue,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _savePositionValue(data: {
	topicId: string;
	valueId: string;
	stanceId: string;
}): Promise<ActionState<PositionValueDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const { id: userId, did } = ctx.user!;

	let position: PositionDBRead;
	try {
		position = await d1.getPositionByUserIdAndTopicId(userId, data.topicId, ctx.logger);
	} catch (error) {
		if (error instanceof NoRecordFoundError) {
			return actionErrorResponse<PositionValueDBRead>(
				error,
				'Please set your overall stance before selecting a stance for a specific value',
				import.meta.env.DEV,
			);
		}
		ctx.logger.error('Failed to find existing position', { error });
		return actionErrorResponse<PositionValueDBRead>(error, 'Failed to find existing position', import.meta.env.DEV);
	}

	try {
		const positionValue = await d1.upsertPositionValue(
			{ positionId: position.id, valueId: data.valueId, stanceId: data.stanceId },
			userId,
			ctx.logger,
		);

		const positionValues = await d1.getPositionValuesByPositionId(position.id, ctx.logger);
		const { uri, cid } = await pds.syncPositionAtpRecord(position, positionValues, did, ctx.logger);
		await d1.setPositionAtpRecord(position.id, uri, cid, ctx.logger);

		return actionSuccessResponse<PositionValueDBRead>(positionValue);
	} catch (error) {
		ctx.logger.error('Failed to save position value', { error });
		return actionErrorResponse<PositionValueDBRead>(error, 'Failed to save position value', import.meta.env.DEV);
	}
}
