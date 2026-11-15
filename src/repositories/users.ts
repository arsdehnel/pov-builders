import { isValidDid } from '@atproto/syntax';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidDIDError, InvalidUUIDError, NoRecordFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { flattenError, validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { users } from '@/models';
import type { UserDBRead } from '@/types';

// export async function getUsers(logger: Logger, includeDeleted = false): Promise<UserDBRead[]> {
// 	logger.debug('Fetching all users');
// 	return db
// 		.select()
// 		.from(users)
// 		.where(includeDeleted ? undefined : isNull(users.deletedAt));
// }

// export async function updateUser(
// 	id: string,
// 	data: Partial<UserWriteInput>,
// 	actingUserId: string,
// 	logger: Logger,
// ): Promise<UserDBRead> {
// 	if (!validateUuid(id)) {
// 		throw new RepositoryError(RepositoryErrorTypes.InvalidUUID, [id, 'User']);
// 	}

// 	logger.debug(`Updating user ${id}`);
// 	const updated = await db
// 		.update(users)
// 		.set({ ...data, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
// 		.where(and(eq(users.id, id), isNull(users.deletedAt)))
// 		.returning();

// 	if (updated.length === 0) {
// 		throw new RepositoryError(RepositoryErrorTypes.NoRecordFound, ['User']);
// 	}
// 	if (updated.length !== 1) {
// 		throw new RepositoryError(RepositoryErrorTypes.TooManyRecordsFound, [updated.length, 1, 'User']);
// 	}

// 	logger.info(`Updated user ${id}`);
// 	return updated[0];
// }

// export async function createUser(did: string, actingUserId: string | null, logger: Logger): Promise<UserDBRead> {
// 	logger.debug(`Creating user ${did}`);
// 	const user: UserWriteInput = {
// 		did,
// 	};
// 	const [insertedUser] = await db
// 		.insert(users)
// 		.values({ ...user, createdBy: actingUserId })
// 		.returning();
// 	logger.info(`Created user ${insertedUser.id}`);
// 	return insertedUser;
// }

// export async function deleteUser(id: string, actingUserId: string | null, logger: Logger): Promise<UserDBRead> {
// 	if (!validateUuid(id)) {
// 		throw new RepositoryError(RepositoryErrorTypes.InvalidUUID, [id, 'User']);
// 	}

// 	logger.debug(`Deleting user ${id}`);
// 	const deleted = await db
// 		.update(users)
// 		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
// 		.where(eq(users.id, id))
// 		.returning();

// 	if (deleted.length === 0) {
// 		throw new RepositoryError(RepositoryErrorTypes.NoRecordFound, ['User']);
// 	}
// 	if (deleted.length !== 1) {
// 		throw new RepositoryError(RepositoryErrorTypes.TooManyRecordsFound, [deleted.length, 1, 'User']);
// 	}

// 	logger.info(`Deleted user ${id}`);
// 	return deleted[0];
// }

export async function getUserById(userId: string, logger: Logger): Promise<UserDBRead> {
	if (!validateUuid(userId)) {
		throw new InvalidUUIDError(userId, 'User');
	}

	logger.debug(`Fetching user ${userId}`);
	let user: UserDBRead | undefined;
	try {
		const matchedUsers = await db
			.select()
			.from(users)
			.where(and(eq(users.id, userId), isNull(users.deletedAt)));
		user = matchedUsers[0];
	} catch (err) {
		const { message, error } = flattenError(err);
		logger.error(`Error fetching user ${userId}${message}`, { err: error });
		throw error;
	}

	if (!user) {
		throw new NoRecordFoundError('User');
	}

	return user;
}

export async function upsertUser(
	did: string,
	handle: string | null,
	actingUserId: string | null,
	logger: Logger,
): Promise<UserDBRead> {
	if (!isValidDid(did)) {
		throw new InvalidDIDError(did, 'User');
	}

	logger.debug(`Upserting user ${did}`);
	let user: UserDBRead | undefined;
	try {
		const upsertedUsers = await db
			.insert(users)
			.values({
				did,
				handle: handle ?? null,
			})
			.onConflictDoUpdate({
				target: users.did,
				set: {
					handle: sql`COALESCE(excluded.handle, ${users.handle})`,
					updatedAt: new Date().toISOString(),
					updatedBy: actingUserId,
				},
			})
			.returning();
		user = upsertedUsers[0];
	} catch (err) {
		const { message, error } = flattenError(err);
		logger.error(`Error upserting user ${did}${message}`, { err: error });
		throw error;
	}

	if (!user) {
		throw new NoRecordFoundError('User', 500);
	}

	return user;
}

// Returns the stored handle for a DID if we've seen this user before, null otherwise.
// Used by the webhook handler to skip HTTP resolution for known users.
export async function getUserHandle(did: string): Promise<string | null> {
	const rows = await db.select({ handle: users.handle }).from(users).where(eq(users.did, did)).limit(1);
	return rows[0]?.handle ?? null;
}
