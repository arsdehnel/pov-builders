import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { apiKeys } from '@/models';
import type { ApiKeyDBRead, ApiKeyFormInput } from '@/types';

export async function getApiKeysByUserId(userId: string, logger: Logger): Promise<ApiKeyDBRead[]> {
	logger.debug(`Fetching API keys for user ${userId}`);
	const matched = await db
		.select()
		.from(apiKeys)
		.where(and(eq(apiKeys.userId, userId), isNull(apiKeys.deletedAt)));
	logger.debug(`Fetched ${matched.length} API keys for user ${userId}`);
	return matched;
}

export async function getApiKeyById(apiKeyId: string, logger: Logger): Promise<ApiKeyDBRead> {
	if (!validateUuid(apiKeyId)) {
		throw new InvalidUUIDError(apiKeyId, 'ApiKey');
	}

	logger.debug(`Fetching API key ${apiKeyId}`);
	const matched = await db
		.select()
		.from(apiKeys)
		.where(and(eq(apiKeys.id, apiKeyId), isNull(apiKeys.deletedAt)));

	if (matched.length === 0) {
		throw new NoRecordFoundError('ApiKey');
	}
	if (matched.length !== 1) {
		throw new TooManyRecordsFoundError('ApiKey', matched.length, 1);
	}

	return matched[0];
}

export async function getApiKeyByKey(key: string, logger: Logger): Promise<ApiKeyDBRead> {
	logger.debug('Fetching API key by key');
	const matched = await db
		.select()
		.from(apiKeys)
		.where(and(eq(apiKeys.apiKey, key), isNull(apiKeys.deletedAt)));

	if (matched.length === 0) {
		throw new NoRecordFoundError('ApiKey');
	}
	if (matched.length !== 1) {
		throw new TooManyRecordsFoundError('ApiKey', matched.length, 1);
	}

	return matched[0];
}

export async function createApiKey(apiKey: ApiKeyFormInput, actingUserId: string, logger: Logger): Promise<ApiKeyDBRead> {
	logger.debug('Creating API key');

	const [result] = await db
		.insert(apiKeys)
		.values({
			...apiKey,
			createdBy: actingUserId,
		})
		.returning();

	logger.info(`Created API key ${result.id}`);
	return result;
}

export async function deleteApiKey(apiKeyId: string, actingUserId: string, logger: Logger): Promise<ApiKeyDBRead> {
	if (!validateUuid(apiKeyId)) {
		throw new InvalidUUIDError(apiKeyId, 'ApiKey');
	}

	logger.debug(`Deleting API key ${apiKeyId}`);
	const deleted = await db
		.update(apiKeys)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(apiKeys.id, apiKeyId))
		.returning();

	if (deleted.length === 0) {
		throw new NoRecordFoundError('ApiKey');
	}
	if (deleted.length !== 1) {
		throw new TooManyRecordsFoundError('ApiKey', deleted.length, 1);
	}

	logger.info(`Deleted API key ${apiKeyId}`);
	return deleted[0];
}

export async function updateApiKey(
	apiKeyId: string,
	apiKey: ApiKeyFormInput,
	actingUserId: string,
	logger: Logger,
): Promise<ApiKeyDBRead> {
	if (!validateUuid(apiKeyId)) {
		throw new InvalidUUIDError(apiKeyId, 'ApiKey');
	}

	logger.debug(`Updating API key ${apiKeyId}`);
	const updated = await db
		.update(apiKeys)
		.set({
			...apiKey,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: actingUserId,
		})
		.where(eq(apiKeys.id, apiKeyId))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('ApiKey');
	}
	if (updated.length !== 1) {
		throw new TooManyRecordsFoundError('ApiKey', updated.length, 1);
	}

	logger.info(`Updated API key ${apiKeyId}`);
	return updated[0];
}
