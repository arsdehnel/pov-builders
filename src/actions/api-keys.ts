'use server';

import {
	type ActionState,
	actionErrorResponse,
	actionSuccessResponse,
	actionValidationError,
} from '@arsdehnel/rwsdk-atp/response';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { d1 } from '@/repositories';
import { apiKeysSchemas } from '@/schemas';
import type { ApiKeyDBRead, ApiKeyFormInput } from '@/types';

export const deleteApiKey = serverAction([requireAuthentication, requirePermissions('api-keys:delete'), _deleteApiKey]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _deleteApiKey(apiKeyId: string): Promise<ActionState<ApiKeyDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	try {
		const deleted = await d1.deleteApiKey(apiKeyId, userId, ctx.logger);
		ctx.logger.info('API key deleted', { apiKeyId: deleted.id });
		return actionSuccessResponse<ApiKeyDBRead>(deleted);
	} catch (error) {
		ctx.logger.error('Failed to delete API key', { error });
		return actionErrorResponse<ApiKeyDBRead>(error, 'Failed to delete item', import.meta.env.DEV);
	}
}

export const saveApiKey = serverAction([
	requireAuthentication,
	requirePermissions('api-keys:create', 'api-keys:update'),
	_saveApiKey,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveApiKey(formData: ApiKeyFormInput): Promise<ActionState<ApiKeyDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('API key form data received', { id: formData.id, name: formData.name });

	const parsed = apiKeysSchemas.form.safeParse(formData);

	if (parsed.error) {
		return actionValidationError<ApiKeyDBRead>(parsed.error.flatten().fieldErrors);
	}

	let apiKey: ApiKeyDBRead;
	try {
		if (parsed.data.id) {
			apiKey = await d1.updateApiKey(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
		} else {
			apiKey = await d1.createApiKey(parsed.data, userId, requestInfo.ctx.logger);
		}
		requestInfo.ctx.logger.info('API key saved', { apiKeyId: apiKey.id });

		return actionSuccessResponse<ApiKeyDBRead>(apiKey);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save API key', { error });
		return actionErrorResponse<ApiKeyDBRead>(error, 'Failed to save item', import.meta.env.DEV);
	}
}
