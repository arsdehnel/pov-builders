import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, apiSuccessResponse } from 'rwsdk-atp/response';
import { validateUuid } from 'rwsdk-atp/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import {
	deleteTopic,
	getStancesByTopicId,
	getTopicById,
	getValuesByTopicId,
	setStanceAtpRecord,
	setTopicAtpRecord,
	setValueAtpRecord,
	syncStanceAtpRecord,
	syncTopicAtpRecord,
	syncValueAtpRecord,
	updateTopic,
} from '@/repositories';
import { topicsSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('topics:read'), _getHandler] as const,
	put: [requireAuthentication, requirePermissions('topics:update'), _putHandler] as const,
	delete: [requireAuthentication, requirePermissions('topics:delete'), _deleteHandler] as const,
};

function parseTopicId(params: Record<string, string>): string | null {
	return validateUuid(params.topicId) ? params.topicId : null;
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx, params }: RequestInfo): Promise<Response> {
	const id = parseTopicId(params);
	if (!id) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const topic = await getTopicById(id, ctx.logger);
		return apiSuccessResponse(topic);
	} catch (err) {
		return apiErrorResponse(err, 'Error fetching topic', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _putHandler({ request, ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = parseTopicId(params);
	if (!id) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const body = await request.json();
		const parsed = topicsSchemas.apiUpdate.parse(body);
		const topic = await updateTopic(id, parsed, userId, ctx.logger);
		const { uri, cid } = await syncTopicAtpRecord(topic, ctx.logger);
		await setTopicAtpRecord(topic.id, uri, cid, ctx.logger);

		const [stances, values] = await Promise.all([getStancesByTopicId(id, ctx.logger), getValuesByTopicId(id, ctx.logger)]);
		for (const stance of stances) {
			const { uri: stanceUri, cid: stanceCid } = await syncStanceAtpRecord(stance, ctx.logger);
			await setStanceAtpRecord(stance.id, stanceUri, stanceCid, ctx.logger);
		}
		for (const value of values) {
			const { uri: valueUri, cid: valueCid } = await syncValueAtpRecord(value, ctx.logger);
			await setValueAtpRecord(value.id, valueUri, valueCid, ctx.logger);
		}

		return apiSuccessResponse(topic);
	} catch (err) {
		return apiErrorResponse(err, 'Error updating topic', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _deleteHandler({ ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = parseTopicId(params);
	if (!id) return Response.json({ success: false, error: 'Invalid topic ID' }, { status: 400 });

	try {
		const topic = await deleteTopic(id, userId, ctx.logger);
		return apiSuccessResponse(topic);
	} catch (err) {
		return apiErrorResponse(err, 'Error deleting topic', import.meta.env.DEV);
	}
}
