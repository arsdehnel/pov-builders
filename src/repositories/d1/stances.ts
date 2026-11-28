import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import type { Logger } from '@arsdehnel/rwsdk-atp/logger';
import { validateUuid } from '@arsdehnel/rwsdk-atp/utils';
import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { stances } from '@/models';
import { DatabaseOperationError } from '@/repositories/errors';
import type { StanceDBRead, StanceFormInput } from '@/types';

export async function getStancesByTopicId(topicId: string, logger: Logger): Promise<StanceDBRead[]> {
	if (!validateUuid(topicId)) {
		throw new InvalidUUIDError(topicId, 'Topic');
	}
	logger.debug(`Fetching stances for topic ${topicId}`);
	let result: StanceDBRead[];
	try {
		result = await db
			.select()
			.from(stances)
			.where(and(eq(stances.topicId, topicId), isNull(stances.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching stances for topic ${topicId}`, { error: err });
		throw new DatabaseOperationError(`fetching stances for topic ${topicId}`, err);
	}
	logger.debug(`Fetched ${result.length} stances for topic ${topicId}`);
	return result;
}

export async function getStanceById(id: string, logger: Logger): Promise<StanceDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Stance');
	}
	logger.debug(`Fetching stance ${id}`);
	let matched: StanceDBRead[];
	try {
		matched = await db
			.select()
			.from(stances)
			.where(and(eq(stances.id, id), isNull(stances.deletedAt)));
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error fetching stance ${id}`, { error: err });
		throw new DatabaseOperationError(`fetching stance ${id}`, err);
	}

	if (matched.length === 0) {
		logger.warn(`Stance ${id} not found`);
		throw new NoRecordFoundError('Stance');
	}
	if (matched.length !== 1) {
		logger.warn(`Found ${matched.length} stances with id ${id}, expected 1`);
		throw new TooManyRecordsFoundError('Stance', matched.length, 1);
	}

	return matched[0];
}

export async function createStance(
	data: StanceFormInput & { topicId: string },
	actingUserId: string,
	logger: Logger,
): Promise<StanceDBRead> {
	logger.debug(`Creating stance ${data.slug} for topic ${data.topicId}`);
	let result: StanceDBRead;
	try {
		const [row] = await db
			.insert(stances)
			.values({ ...data, createdBy: actingUserId })
			.returning();
		result = row;
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error creating stance ${data.slug} for topic ${data.topicId}`, { error: err });
		throw new DatabaseOperationError(`creating stance ${data.slug} for topic ${data.topicId}`, err);
	}
	logger.info(`Created stance ${result.id}`);
	return result;
}

export async function updateStance(
	id: string,
	data: Partial<StanceFormInput>,
	actingUserId: string,
	logger: Logger,
): Promise<StanceDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Stance');
	}
	logger.debug(`Updating stance ${id}`);
	let updated: StanceDBRead[];
	try {
		updated = await db
			.update(stances)
			.set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, updatedBy: actingUserId })
			.where(and(eq(stances.id, id), isNull(stances.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error updating stance ${id}`, { error: err });
		throw new DatabaseOperationError(`updating stance ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Stance ${id} not found when updating`);
		throw new NoRecordFoundError('Stance');
	}
	if (updated.length !== 1) {
		logger.warn(`Found ${updated.length} stances with id ${id} when updating, expected 1`);
		throw new TooManyRecordsFoundError('Stance', updated.length, 1);
	}

	logger.info(`Updated stance ${id}`);
	return updated[0];
}

export async function setStanceAtpRecord(id: string, atpUri: string, atpCid: string, logger: Logger): Promise<StanceDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Stance');
	}
	logger.debug(`Setting ATP record for stance ${id}`);
	let updated: StanceDBRead[];
	try {
		updated = await db
			.update(stances)
			.set({ atpUri, atpCid })
			.where(and(eq(stances.id, id), isNull(stances.deletedAt)))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error setting ATP record for stance ${id}`, { error: err });
		throw new DatabaseOperationError(`setting ATP record for stance ${id}`, err);
	}

	if (updated.length === 0) {
		logger.warn(`Stance ${id} not found when setting ATP record`);
		throw new NoRecordFoundError('Stance');
	}

	logger.info(`Set ATP record for stance ${id}: ${atpUri}`);
	return updated[0];
}

export async function deleteStance(id: string, actingUserId: string, logger: Logger): Promise<StanceDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Stance');
	}
	logger.debug(`Deleting stance ${id}`);
	let deleted: StanceDBRead[];
	try {
		deleted = await db
			.update(stances)
			.set({ deletedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, deletedBy: actingUserId })
			.where(eq(stances.id, id))
			.returning();
	} catch (err) {
		if (err instanceof RepositoryError) throw err;
		logger.error(`Error deleting stance ${id}`, { error: err });
		throw new DatabaseOperationError(`deleting stance ${id}`, err);
	}

	if (deleted.length === 0) {
		logger.warn(`Stance ${id} not found when deleting`);
		throw new NoRecordFoundError('Stance');
	}
	if (deleted.length !== 1) {
		logger.warn(`Found ${deleted.length} stances with id ${id} when deleting, expected 1`);
		throw new TooManyRecordsFoundError('Stance', deleted.length, 1);
	}

	logger.info(`Deleted stance ${id}`);
	return deleted[0];
}
