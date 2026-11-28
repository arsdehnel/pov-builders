import { apiErrorResponse, apiSuccessResponse } from '@arsdehnel/rwsdk-atp/response';
import { validateUuid } from '@arsdehnel/rwsdk-atp/utils';
import type { RequestInfo } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import { stancesSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('stances:read'), _getHandler] as const,
	post: [requireAuthentication, requirePermissions('stances:create'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx, params }: RequestInfo): Promise<Response> {
	const topicId = validateUuid(params.topicId) ? params.topicId : null;
	if (!topicId) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const data = await d1.getStancesByTopicId(topicId, ctx.logger);
		return apiSuccessResponse(data);
	} catch (err) {
		ctx.logger.error('Error fetching stances', { error: err });
		return apiErrorResponse(err, 'Error fetching stances', import.meta.env.DEV);
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
		const parsed = stancesSchemas.apiInsert.parse(body);
		const stance = await d1.createStance({ ...parsed, topicId }, userId, ctx.logger);
		const { uri, cid } = await pds.syncStanceAtpRecord(stance, ctx.logger);
		await d1.setStanceAtpRecord(stance.id, uri, cid, ctx.logger);
		return apiSuccessResponse(stance, 201);
	} catch (err) {
		ctx.logger.error('Error creating stance', { error: err });
		return apiErrorResponse(err, 'Error creating stance', import.meta.env.DEV);
	}
}
