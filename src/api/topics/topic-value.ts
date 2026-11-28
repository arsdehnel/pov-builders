import { apiErrorResponse, apiSuccessResponse } from '@arsdehnel/rwsdk-atp/response';
import { validateUuid } from '@arsdehnel/rwsdk-atp/utils';
import type { RequestInfo } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1, pds } from '@/repositories';
import { valuesSchemas } from '@/schemas';

export default {
	get: [requireAuthentication, requirePermissions('values:read'), _getHandler] as const,
	put: [requireAuthentication, requirePermissions('values:update'), _putHandler] as const,
	delete: [requireAuthentication, requirePermissions('values:delete'), _deleteHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ ctx, params }: RequestInfo): Promise<Response> {
	const id = validateUuid(params.valueId) ? params.valueId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid value ID' }, { status: 400 });

	try {
		const value = await d1.getValueById(id, ctx.logger);
		return apiSuccessResponse(value);
	} catch (err) {
		ctx.logger.error('Error fetching value', { error: err });
		return apiErrorResponse(err, 'Error fetching value', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _putHandler({ request, ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = validateUuid(params.valueId) ? params.valueId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid value ID' }, { status: 400 });

	try {
		const body = await request.json();
		const parsed = valuesSchemas.apiUpdate.parse(body);
		const value = await d1.updateValue(id, parsed, userId, ctx.logger);
		const { uri, cid } = await pds.syncValueAtpRecord(value, ctx.logger);
		await d1.setValueAtpRecord(value.id, uri, cid, ctx.logger);
		return apiSuccessResponse(value);
	} catch (err) {
		ctx.logger.error('Error updating value', { error: err });
		return apiErrorResponse(err, 'Error updating value', import.meta.env.DEV);
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _deleteHandler({ ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const id = validateUuid(params.valueId) ? params.valueId : null;
	if (!id) return Response.json({ success: false, error: 'Invalid value ID' }, { status: 400 });

	try {
		const value = await d1.deleteValue(id, userId, ctx.logger);
		return apiSuccessResponse(value);
	} catch (err) {
		ctx.logger.error('Error deleting value', { error: err });
		return apiErrorResponse(err, 'Error deleting value', import.meta.env.DEV);
	}
}
