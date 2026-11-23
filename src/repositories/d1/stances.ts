import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidUUIDError, NoRecordFoundError, TooManyRecordsFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { stances } from '@/models';
import type { StanceDBRead, StanceFormInput } from '@/types';

export async function getStancesByTopicId(topicId: string, logger: Logger): Promise<StanceDBRead[]> {
	logger.debug(`Fetching stances for topic ${topicId}`);
	return db
		.select()
		.from(stances)
		.where(and(eq(stances.topicId, topicId), isNull(stances.deletedAt)));
}

export async function getStanceById(id: string, logger: Logger): Promise<StanceDBRead> {
	if (!validateUuid(id)) {
		throw new InvalidUUIDError(id, 'Stance');
	}
	logger.debug(`Fetching stance ${id}`);
	const matched = await db
		.select()
		.from(stances)
		.where(and(eq(stances.id, id), isNull(stances.deletedAt)));

	if (matched.length === 0) {
		throw new NoRecordFoundError('Stance');
	}
	if (matched.length !== 1) {
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
	const [result] = await db
		.insert(stances)
		.values({ ...data, createdBy: actingUserId })
		.returning();

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
	const updated = await db
		.update(stances)
		.set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, updatedBy: actingUserId })
		.where(and(eq(stances.id, id), isNull(stances.deletedAt)))
		.returning();

	if (updated.length === 0) {
		throw new NoRecordFoundError('Stance');
	}
	if (updated.length !== 1) {
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
	const updated = await db
		.update(stances)
		.set({ atpUri, atpCid })
		.where(and(eq(stances.id, id), isNull(stances.deletedAt)))
		.returning();

	if (updated.length === 0) {
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
	const deleted = await db
		.update(stances)
		.set({ deletedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`, deletedBy: actingUserId })
		.where(eq(stances.id, id))
		.returning();

	if (deleted.length === 0) {
		throw new NoRecordFoundError('Stance');
	}
	if (deleted.length !== 1) {
		throw new TooManyRecordsFoundError('Stance', deleted.length, 1);
	}

	logger.info(`Deleted stance ${id}`);
	return deleted[0];
}
