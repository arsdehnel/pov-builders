import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { validateUuid } from '@arsdehnel/rwsdk-atp/utils';
import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { topics } from '@/models';
import { DatabaseOperationError } from '@/repositories/errors';
import type { TopicDBRead, TopicFormInput } from '@/types';

export async function getTopics(logger: Logger, includeDeleted = false): Promise<TopicDBRead[]> {
	logger.debug('Fetching all topics');
	let result: TopicDBRead[];
	try {
		result = await db
			.select()
			.from(topics)
			.where(includeDeleted ? undefined : isNull(topics.deletedAt));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error('Error fetching topics', { error: err });
		throw new DatabaseOperationError('fetching topics', err);
	}
	logger.debug(`Fetched ${result.length} topics`);
	return result;
}

export async function getTopicById(id: string, logger: Logger): Promise<TopicDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Topic');
	}
	logger.debug(`Fetching topic ${id}`);
	let matched: TopicDBRead[];
	try {
		matched = await db
			.select()
			.from(topics)
			.where(and(eq(topics.id, id), isNull(topics.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching topic ${id}`, { error: err });
		throw new DatabaseOperationError(`fetching topic ${id}`, err);
	}

	if (matched.length === 0) {
		logger.warn(`Topic ${id} not found`);
		throw new NoRecordFoundError('Topic');
	}
	if (matched.length !== 1) {
		logger.warn(`Found ${matched.length} topics with id ${id}, expected 1`);
		throw new TooManyRecordsFoundError('Topic', matched.length, 1);
	}

	return matched[0];
}

export async function getTopicBySubdomain(subdomain: string, logger: Logger): Promise<TopicDBRead> {
	logger.debug(`Fetching topic by subdomain ${subdomain}`);
	let matched: TopicDBRead[];
	try {
		matched = await db
			.select()
			.from(topics)
			.where(and(eq(topics.subdomain, subdomain), isNull(topics.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching topic by subdomain ${subdomain}`, { error: err });
		throw new DatabaseOperationError(`fetching topic by subdomain ${subdomain}`, err);
	}

	if (matched.length === 0) {
		logger.warn(`Topic with subdomain "${subdomain}" not found`);
		throw new NoRecordFoundError('Topic');
	}
	if (matched.length !== 1) {
		logger.warn(`Found ${matched.length} topics with subdomain "${subdomain}", expected 1`);
		throw new TooManyRecordsFoundError('Topic', matched.length, 1);
	}

	return matched[0];
}

export async function createTopic(data: TopicFormInput, actingUserId: string, logger: Logger): Promise<TopicDBRead> {
	logger.debug(`Creating topic ${data.subdomain}`);
	let result: TopicDBRead;
	try {
		const [row] = await db
			.insert(topics)
			.values({ ...data, createdBy: actingUserId })
			.returning();
		result = row;
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error creating topic ${data.subdomain}`, { error: err });
		throw new DatabaseOperationError(`creating topic ${data.subdomain}`, err);
	}
	logger.info(`Created topic ${result.id}`);
	return result;
}

export async function updateTopic(
	id: string,
	data: Partial<TopicFormInput>,
	actingUserId: string,
	logger: Logger,
): Promise<TopicDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Topic');
	}
	logger.debug(`Updating topic ${id}`);
	let updated: TopicDBRead[];
	try {
		updated = await db
			.update(topics)
			.set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, updatedBy: actingUserId })
			.where(and(eq(topics.id, id), isNull(topics.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error updating topic ${id}`, { error: err });
		throw new DatabaseOperationError(`updating topic ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Topic ${id} not found when updating`);
		throw new NoRecordFoundError('Topic');
	}
	if (updated.length !== 1) {
		logger.warn(`Found ${updated.length} topics with id ${id} when updating, expected 1`);
		throw new TooManyRecordsFoundError('Topic', updated.length, 1);
	}

	logger.info(`Updated topic ${id}`);
	return updated[0];
}

export async function setTopicAtpRecord(id: string, atpUri: string, atpCid: string, logger: Logger): Promise<TopicDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Topic');
	}
	logger.debug(`Setting ATP record for topic ${id}`);
	let updated: TopicDBRead[];
	try {
		updated = await db
			.update(topics)
			.set({ atpUri, atpCid })
			.where(and(eq(topics.id, id), isNull(topics.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error setting ATP record for topic ${id}`, { error: err });
		throw new DatabaseOperationError(`setting ATP record for topic ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Topic ${id} not found when setting ATP record`);
		throw new NoRecordFoundError('Topic');
	}

	logger.info(`Set ATP record for topic ${id}: ${atpUri}`);
	return updated[0];
}

export async function deleteTopic(id: string, actingUserId: string, logger: Logger): Promise<TopicDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Topic');
	}
	logger.debug(`Deleting topic ${id}`);
	let deleted: TopicDBRead[];
	try {
		deleted = await db
			.update(topics)
			.set({ deletedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, deletedBy: actingUserId })
			.where(eq(topics.id, id))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error deleting topic ${id}`, { error: err });
		throw new DatabaseOperationError(`deleting topic ${id}`, err);
	}

	if (deleted.length === 0) {
		logger.warn(`Topic ${id} not found when deleting`);
		throw new NoRecordFoundError('Topic');
	}
	if (deleted.length !== 1) {
		logger.warn(`Found ${deleted.length} topics with id ${id} when deleting, expected 1`);
		throw new TooManyRecordsFoundError('Topic', deleted.length, 1);
	}

	logger.info(`Deleted topic ${id}`);
	return deleted[0];
}
