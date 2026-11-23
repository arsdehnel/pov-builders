import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, apiSuccessResponse } from 'rwsdk-atp/response';
import { validateUuid } from 'rwsdk-atp/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { deleteStance, getStanceById, setStanceAtpRecord, syncStanceAtpRecord, updateStance } from '@/repositories';
import { stancesSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('stances:read'), _getHandler] as const,
	put: [requireAuthentication, requirePermissions('stances:update'), _putHandler] as const,
	delete: [requireAuthentication, requirePermissions('stances:delete'), _deleteHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx, params }: RequestInfo): Promise<Response> {
	const id = validateUuid(params.stanceId) ? params.stanceId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid stance ID' }, { status: 400 });

	try {
		const stance = await getStanceById(id, ctx.logger);
		return apiSuccessResponse(stance);
	} catch (err) {
		return apiErrorResponse(err, 'Error fetching stance', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _putHandler({ request, ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = validateUuid(params.stanceId) ? params.stanceId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid stance ID' }, { status: 400 });

	try {
		const body = await request.json();
		const parsed = stancesSchemas.apiUpdate.parse(body);
		const stance = await updateStance(id, parsed, userId, ctx.logger);
		const { uri, cid } = await syncStanceAtpRecord(stance, ctx.logger);
		await setStanceAtpRecord(stance.id, uri, cid, ctx.logger);
		return apiSuccessResponse(stance);
	} catch (err) {
		return apiErrorResponse(err, 'Error updating stance', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _deleteHandler({ ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = validateUuid(params.stanceId) ? params.stanceId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid stance ID' }, { status: 400 });

	try {
		const stance = await deleteStance(id, userId, ctx.logger);
		return apiSuccessResponse(stance);
	} catch (err) {
		return apiErrorResponse(err, 'Error deleting stance', import.meta.env.DEV);
	}
}
