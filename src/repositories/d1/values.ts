import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { validateUuid } from '@arsdehnel/rwsdk-atp/utils';
import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { values } from '@/models';
import { DatabaseOperationError } from '@/repositories/errors';
import type { ValueDBRead, ValueFormInput } from '@/types';

export async function getValuesByTopicId(topicId: string, logger: Logger): Promise<ValueDBRead[]> {
	if (!validateUuid(topicId)) {
		throw new InvalidUUIDError(topicId, 'Topic');
	}
	logger.debug(`Fetching values for topic ${topicId}`);
	let result: ValueDBRead[];
	try {
		result = await db
			.select()
			.from(values)
			.where(and(eq(values.topicId, topicId), isNull(values.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching values for topic ${topicId}`, { error: err });
		throw new DatabaseOperationError(`fetching values for topic ${topicId}`, err);
	}
	logger.debug(`Fetched ${result.length} values for topic ${topicId}`);
	return result;
}

export async function getValueById(id: string, logger: Logger): Promise<ValueDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Value');
	}
	logger.debug(`Fetching value ${id}`);
	let matched: ValueDBRead[];
	try {
		matched = await db
			.select()
			.from(values)
			.where(and(eq(values.id, id), isNull(values.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching value ${id}`, { error: err });
		throw new DatabaseOperationError(`fetching value ${id}`, err);
	}

	if (matched.length === 0) {
		logger.warn(`Value ${id} not found`);
		throw new NoRecordFoundError('Value');
	}
	if (matched.length !== 1) {
		logger.warn(`Found ${matched.length} values with id ${id}, expected 1`);
		throw new TooManyRecordsFoundError('Value', matched.length, 1);
	}

	return matched[0];
}

export async function createValue(data: ValueFormInput, actingUserId: string, logger: Logger): Promise<ValueDBRead> {
	logger.debug(`Creating value ${data.slug}`);
	let result: ValueDBRead;
	try {
		const [row] = await db
			.insert(values)
			.values({ ...data, createdBy: actingUserId })
			.returning();
		result = row;
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error creating value ${data.slug}`, { error: err });
		throw new DatabaseOperationError(`creating value ${data.slug}`, err);
	}
	logger.info(`Created value ${result.id}`);
	return result;
}

export async function updateValue(
	id: string,
	data: Partial<ValueFormInput>,
	actingUserId: string,
	logger: Logger,
): Promise<ValueDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Value');
	}
	logger.debug(`Updating value ${id}`);
	let updated: ValueDBRead[];
	try {
		updated = await db
			.update(values)
			.set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, updatedBy: actingUserId })
			.where(and(eq(values.id, id), isNull(values.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error updating value ${id}`, { error: err });
		throw new DatabaseOperationError(`updating value ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Value ${id} not found when updating`);
		throw new NoRecordFoundError('Value');
	}
	if (updated.length !== 1) {
		logger.warn(`Found ${updated.length} values with id ${id} when updating, expected 1`);
		throw new TooManyRecordsFoundError('Value', updated.length, 1);
	}

	logger.info(`Updated value ${id}`);
	return updated[0];
}

export async function setValueAtpRecord(id: string, atpUri: string, atpCid: string, logger: Logger): Promise<ValueDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Value');
	}
	logger.debug(`Setting ATP record for value ${id}`);
	let updated: ValueDBRead[];
	try {
		updated = await db
			.update(values)
			.set({ atpUri, atpCid })
			.where(and(eq(values.id, id), isNull(values.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error setting ATP record for value ${id}`, { error: err });
		throw new DatabaseOperationError(`setting ATP record for value ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Value ${id} not found when setting ATP record`);
		throw new NoRecordFoundError('Value');
	}

	logger.info(`Set ATP record for value ${id}: ${atpUri}`);
	return updated[0];
}

export async function deleteValue(id: string, actingUserId: string, logger: Logger): Promise<ValueDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Value');
	}
	logger.debug(`Deleting value ${id}`);
	let deleted: ValueDBRead[];
	try {
		deleted = await db
			.update(values)
			.set({ deletedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, deletedBy: actingUserId })
			.where(eq(values.id, id))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error deleting value ${id}`, { error: err });
		throw new DatabaseOperationError(`deleting value ${id}`, err);
	}

	if (deleted.length === 0) {
		logger.warn(`Value ${id} not found when deleting`);
		throw new NoRecordFoundError('Value');
	}
	if (deleted.length !== 1) {
		logger.warn(`Found ${deleted.length} values with id ${id} when deleting, expected 1`);
		throw new TooManyRecordsFoundError('Value', deleted.length, 1);
	}

	logger.info(`Deleted value ${id}`);
	return deleted[0];
}
