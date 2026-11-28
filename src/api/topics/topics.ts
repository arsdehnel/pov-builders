import { apiErrorResponse, apiSuccessResponse } from '@arsdehnel/rwsdk-atp/response';
import type { RequestInfo } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import { topicsSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('topics:read'), _getHandler] as const,
	post: [requireAuthentication, requirePermissions('topics:create'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx }: RequestInfo): Promise<Response> {
	try {
		const data = await d1.getTopics(ctx.logger);
		return apiSuccessResponse(data);
	} catch (err) {
		ctx.logger.error('Error fetching topics', { error: err });
		return apiErrorResponse(err, 'Error fetching topics', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	try {
		const body = await request.json();
		const parsed = topicsSchemas.apiInsert.parse(body);
		const topic = await d1.createTopic(parsed, userId, ctx.logger);
		const { uri, cid } = await pds.syncTopicAtpRecord(topic, ctx.logger);
		await d1.setTopicAtpRecord(topic.id, uri, cid, ctx.logger);
		return apiSuccessResponse(topic, 201);
	} catch (err) {
		ctx.logger.error('Error creating topic', { error: err });
		return apiErrorResponse(err, 'Error creating topic', import.meta.env.DEV);
	}
}
