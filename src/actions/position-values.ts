'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { type ActionState, actionErrorResponse, actionSuccessResponse } from 'rwsdk-atp/response';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { getPositionByUserIdAndTopicId, upsertPositionValue } from '@/repositories';
import type { PositionValueDBRead } from '@/types';

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
	const userId = ctx.user!.id;

	try {
		const position = await getPositionByUserIdAndTopicId(userId, data.topicId, ctx.logger);
		if (!position) {
			return actionErrorResponse<PositionValueDBRead>(
				new Error('No position found'),
				'Please set your overall stance before selecting a stance for a specific value',
				import.meta.env.DEV,
			);
		}

		const positionValue = await upsertPositionValue(
			{ positionId: position.id, valueId: data.valueId, stanceId: data.stanceId },
			userId,
			ctx.logger,
		);
		return actionSuccessResponse<PositionValueDBRead>(positionValue);
	} catch (error) {
		ctx.logger.error('Failed to save position value', { error });
		return actionErrorResponse<PositionValueDBRead>(error, 'Failed to save position value', import.meta.env.DEV);
	}
}
