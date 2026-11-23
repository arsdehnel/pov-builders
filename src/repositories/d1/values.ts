import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { values } from '@/models';
import type { ValueDBRead, ValueFormInput } from '@/types';

export async function getValuesByTopicId(topicId: string, logger: Logger): Promise<ValueDBRead[]> {
	logger.debug(`Fetching values for topic ${topicId}`);
	return db
		.select()
		.from(values)
		.where(and(eq(values.topicId, topicId), isNull(values.deletedAt)));
}

export async function getValueById(id: string, logger: Logger): Promise<ValueDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Value');
	}
	logger.debug(`Fetching value ${id}`);
	const matched = await db
		.select()
		.from(values)
		.where(and(eq(values.id, id), isNull(values.deletedAt)));

	if (matched.length === 0) {
		throw new NoRecordFoundError('Value');
	}
	if (matched.length !== 1) {
		throw new TooManyRecordsFoundError('Value', matched.length, 1);
	}

	return matched[0];
}

export async function createValue(data: ValueFormInput, actingUserId: string, logger: Logger): Promise<ValueDBRead> {
	logger.debug(`Creating value ${data.slug}`);
	const [result] = await db
		.insert(values)
		.values({ ...data, createdBy: actingUserId })
		.returning();

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
	const updated = await db
		.update(values)
		.set({ ...data, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
		.where(and(eq(values.id, id), isNull(values.deletedAt)))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('Value');
	}
	if (updated.length !== 1) {
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
	const updated = await db
		.update(values)
		.set({ atpUri, atpCid })
		.where(and(eq(values.id, id), isNull(values.deletedAt)))
		.returning();

	if (updated.length === 0) {
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
	const deleted = await db
		.update(values)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(values.id, id))
		.returning();

	if (deleted.length === 0) {
		throw new NoRecordFoundError('Value');
	}
	if (deleted.length !== 1) {
		throw new TooManyRecordsFoundError('Value', deleted.length, 1);
	}

	logger.info(`Deleted value ${id}`);
	return deleted[0];
}
