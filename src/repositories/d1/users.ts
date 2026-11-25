import { isValidDid } from '@atproto/syntax';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { InvalidDIDError, InvalidUUIDError, NoRecordFoundError } from 'rwsdk-atp/errors';
import type { Logger } from 'rwsdk-atp/logger';
import { flattenError, validateUuid } from 'rwsdk-atp/utils';
import db from '@/db';
import { users } from '@/models';
import type { UserDBRead } from '@/types';

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
