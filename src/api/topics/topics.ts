import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, apiSuccessResponse } from 'rwsdk-atp/response';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createTopic, getTopics } from '@/repositories';
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
		const data = await getTopics(ctx.logger);
		return apiSuccessResponse(data);
	} catch (err) {
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
		const topic = await createTopic(parsed, userId, ctx.logger);
		return apiSuccessResponse(topic, 201);
	} catch (err) {
		return apiErrorResponse(err, 'Error creating topic', import.meta.env.DEV);
	}
}
