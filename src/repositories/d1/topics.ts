import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { topics } from '@/models';
import type { TopicDBRead, TopicFormInput } from '@/types';

export async function getTopics(logger: Logger, includeDeleted = false): Promise<TopicDBRead[]> {
	logger.debug('Fetching all topics');
	return db
		.select()
		.from(topics)
		.where(includeDeleted ? undefined : isNull(topics.deletedAt));
}

export async function getTopicById(id: string, logger: Logger): Promise<TopicDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Topic');
	}
	logger.debug(`Fetching topic ${id}`);
	const matched = await db
		.select()
		.from(topics)
		.where(and(eq(topics.id, id), isNull(topics.deletedAt)));

	if (matched.length === 0) {
		throw new NoRecordFoundError('Topic');
	}
	if (matched.length !== 1) {
		throw new TooManyRecordsFoundError('Topic', matched.length, 1);
	}

	return matched[0];
}

export async function getTopicBySubdomain(subdomain: string, logger: Logger): Promise<TopicDBRead | undefined> {
	logger.debug(`Fetching topic by subdomain ${subdomain}`);
	const matched = await db
		.select()
		.from(topics)
		.where(and(eq(topics.subdomain, subdomain), isNull(topics.deletedAt)));

	return matched[0];
}

export async function createTopic(data: TopicFormInput, actingUserId: string, logger: Logger): Promise<TopicDBRead> {
	logger.debug(`Creating topic ${data.subdomain}`);
	const [result] = await db
		.insert(topics)
		.values({ ...data, createdBy: actingUserId })
		.returning();

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
	const updated = await db
		.update(topics)
		.set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, updatedBy: actingUserId })
		.where(and(eq(topics.id, id), isNull(topics.deletedAt)))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('Topic');
	}
	if (updated.length !== 1) {
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
	const updated = await db
		.update(topics)
		.set({ atpUri, atpCid })
		.where(and(eq(topics.id, id), isNull(topics.deletedAt)))
		.returning();

	if (updated.length === 0) {
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
	const deleted = await db
		.update(topics)
		.set({ deletedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, deletedBy: actingUserId })
		.where(eq(topics.id, id))
		.returning();

	if (deleted.length === 0) {
		throw new NoRecordFoundError('Topic');
	}
	if (deleted.length !== 1) {
		throw new TooManyRecordsFoundError('Topic', deleted.length, 1);
	}

	logger.info(`Deleted topic ${id}`);
	return deleted[0];
}
