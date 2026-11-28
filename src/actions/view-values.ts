'use server';

import { NoRecordFoundError } from '@arsdehnel/rwsdk-atp/errors';
import { type ActionState, actionErrorResponse, actionSuccessResponse } from '@arsdehnel/rwsdk-atp/response';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import type { ViewDBRead, ViewValueDBRead } from '@/types';

export const saveViewValue = serverAction([requireAuthentication, requirePermissions('views:update'), _saveViewValue]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveViewValue(data: {
	topicId: string;
	valueId: string;
	stanceId: string;
}): Promise<ActionState<ViewValueDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const { id: userId, did } = ctx.user!;

	let view: ViewDBRead;
	try {
		view = await d1.getViewByUserIdAndTopicId(userId, data.topicId, ctx.logger);
	} catch (error) {
		if (error instanceof NoRecordFoundError) {
			return actionErrorResponse<ViewValueDBRead>(
				error,
				'Please set your overall stance before selecting a stance for a specific value',
				import.meta.env.DEV,
			);
		}
		ctx.logger.error('Failed to find existing view', { error });
		return actionErrorResponse<ViewValueDBRead>(error, 'Failed to find existing view', import.meta.env.DEV);
	}

	try {
		const viewValue = await d1.upsertViewValue(
			{ viewId: view.id, valueId: data.valueId, stanceId: data.stanceId },
			userId,
			ctx.logger,
		);

		const viewValues = await d1.getViewValuesByViewId(view.id, ctx.logger);
		const { uri, cid } = await pds.syncViewAtpRecord(view, viewValues, did, ctx.logger);
		await d1.setViewAtpRecord(view.id, uri, cid, ctx.logger);

		return actionSuccessResponse<ViewValueDBRead>(viewValue);
	} catch (error) {
		ctx.logger.error('Failed to save view value', { error });
		return actionErrorResponse<ViewValueDBRead>(error, 'Failed to save view value', import.meta.env.DEV);
	}
}
