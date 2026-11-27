import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, apiSuccessResponse } from 'rwsdk-atp/response';
import { validateUuid } from 'rwsdk-atp/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import { valuesSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('values:read'), _getHandler] as const,
	post: [requireAuthentication, requirePermissions('values:create'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx, params }: RequestInfo): Promise<Response> {
	const topicId = validateUuid(params.topicId) ? params.topicId : null;
	if (!topicId) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const data = await d1.getValuesByTopicId(topicId, ctx.logger);
		return apiSuccessResponse(data);
	} catch (err) {
		ctx.logger.error('Error fetching values', { error: err });
		return apiErrorResponse(err, 'Error fetching values', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const topicId = validateUuid(params.topicId) ? params.topicId : null;
	if (!topicId) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const body = await request.json();
		const parsed = valuesSchemas.apiInsert.parse(body);
		const value = await d1.createValue({ ...parsed, topicId }, userId, ctx.logger);
		const { uri, cid } = await pds.syncValueAtpRecord(value, ctx.logger);
		await d1.setValueAtpRecord(value.id, uri, cid, ctx.logger);
		return apiSuccessResponse(value, 201);
	} catch (err) {
		ctx.logger.error('Error creating value', { error: err });
		return apiErrorResponse(err, 'Error creating value', import.meta.env.DEV);
	}
}
