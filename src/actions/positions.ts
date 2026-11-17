'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { type ActionState, actionErrorResponse, actionSuccessResponse } from 'rwsdk-atp/response';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { upsertPosition } from '@/repositories';
import type { PositionDBRead } from '@/types';

export const savePosition = serverAction([requireAuthentication, requirePermissions('positions:update'), _savePosition]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _savePosition(data: { topicId: string; overallStanceId: string }): Promise<ActionState<PositionDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	try {
		const position = await upsertPosition(data, userId, ctx.logger);
		return actionSuccessResponse<PositionDBRead>(position);
	} catch (error) {
		ctx.logger.error('Failed to save position', { error });
		return actionErrorResponse<PositionDBRead>(error, 'Failed to save position', import.meta.env.DEV);
	}
}
