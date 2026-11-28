'use server';

import { type ActionState, actionErrorResponse, actionSuccessResponse } from '@arsdehnel/rwsdk-atp/response';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import type { ViewDBRead } from '@/types';

export const saveView = serverAction([requireAuthentication, requirePermissions('views:update'), _saveView]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveView(data: { topicId: string; overallStanceId: string }): Promise<ActionState<ViewDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const { id: userId, did } = ctx.user!;

	try {
		const view = await d1.upsertView(data, userId, ctx.logger);

		const { uri, cid } = await pds.syncViewAtpRecord(view, [], did, ctx.logger);
		await d1.setViewAtpRecord(view.id, uri, cid, ctx.logger);

		return actionSuccessResponse<ViewDBRead>(view);
	} catch (error) {
		ctx.logger.error('Failed to save view', { error });
		return actionErrorResponse<ViewDBRead>(error, 'Failed to save view', import.meta.env.DEV);
	}
}
