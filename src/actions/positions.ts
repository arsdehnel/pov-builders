'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { type ActionState, actionErrorResponse, actionSuccessResponse } from 'rwsdk-atp/response';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import type { PositionDBRead } from '@/types';

export const savePosition = serverAction([requireAuthentication, requirePermissions('positions:update'), _savePosition]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _savePosition(data: { topicId: string; overallStanceId: string }): Promise<ActionState<PositionDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const { id: userId, did } = ctx.user!;

	try {
		const position = await d1.upsertPosition(data, userId, ctx.logger);

		const { uri, cid } = await pds.syncPositionAtpRecord(position, [], did, ctx.logger);
		await d1.setPositionAtpRecord(position.id, uri, cid, ctx.logger);

		return actionSuccessResponse<PositionDBRead>(position);
	} catch (error) {
		ctx.logger.error('Failed to save position', { error });
		return actionErrorResponse<PositionDBRead>(error, 'Failed to save position', import.meta.env.DEV);
	}
}
