import { InvalidDIDError, InvalidUUIDError, NoRecordFoundError, RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseOperationError } from '@/repositories/errors';
import { makeSpyLogger, makeUserRow, TEST_USER_ID } from './helpers';

const { selectFn, insertOcduFn } = vi.hoisted(() => ({
	selectFn: vi.fn(),
	insertOcduFn: vi.fn(),
}));

vi.mock('@/db', () => ({
	default: {
		select: () => ({ from: () => ({ where: selectFn }) }),
		insert: () => ({
			values: () => ({
				returning: vi.fn(),
				onConflictDoUpdate: () => ({ returning: insertOcduFn }),
			}),
		}),
		update: () => ({ set: () => ({ where: () => ({ returning: vi.fn() }) }) }),
	},
}));

import { getUserById, upsertUser } from '../users';

beforeEach(() => {
	selectFn.mockReset();
	insertOcduFn.mockReset();
});

describe('getUserById', () => {
	it('throws InvalidUUIDError for a non-UUID id without touching the DB', async () => {
		await expect(getUserById('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns the user when found', async () => {
		const user = makeUserRow();
		selectFn.mockResolvedValue([user]);
		expect(await getUserById(TEST_USER_ID, createNoopLogger())).toEqual(user);
	});

	it('throws NoRecordFoundError when no user is found', async () => {
		selectFn.mockResolvedValue([]);
		await expect(getUserById(TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('logs warn before throwing NoRecordFoundError', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await expect(getUserById(TEST_USER_ID, logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError (not a raw Error) when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('connection lost'));
		await expect(getUserById(TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		// Invalid UUID
		await expect(getUserById('bad', createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// Not found
		selectFn.mockResolvedValue([]);
		await expect(getUserById(TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// DB failure — previously this re-threw a raw Error; now it must be wrapped
		selectFn.mockRejectedValue(new Error('some DB error'));
		await expect(getUserById(TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});

describe('upsertUser', () => {
	it('throws InvalidDIDError for an invalid DID without touching the DB', async () => {
		await expect(upsertUser('not-a-did', null, null, createNoopLogger())).rejects.toBeInstanceOf(InvalidDIDError);
		expect(insertOcduFn).not.toHaveBeenCalled();
	});

	it('returns the upserted user', async () => {
		const user = makeUserRow();
		insertOcduFn.mockResolvedValue([user]);
		expect(await upsertUser('did:plc:testuser123', 'test.bsky.social', null, createNoopLogger())).toEqual(user);
	});

	it('calls logger.debug and logger.info on success', async () => {
		const logger = makeSpyLogger();
		insertOcduFn.mockResolvedValue([makeUserRow()]);
		await upsertUser('did:plc:testuser123', 'test.bsky.social', null, logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError (not a raw Error) when DB throws', async () => {
		const logger = makeSpyLogger();
		insertOcduFn.mockRejectedValue(new Error('DB constraint error'));
		await expect(upsertUser('did:plc:testuser123', null, null, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('throws NoRecordFoundError with code 500 when the upsert returns no rows', async () => {
		insertOcduFn.mockResolvedValue([]);
		const err = await upsertUser('did:plc:testuser123', null, null, createNoopLogger()).catch(e => e);
		expect(err).toBeInstanceOf(NoRecordFoundError);
		expect((err as NoRecordFoundError).code).toBe(500);
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		// Invalid DID
		await expect(upsertUser('bad-did', null, null, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// DB failure — must be wrapped, not re-thrown raw
		insertOcduFn.mockRejectedValue(new Error('DB error'));
		await expect(upsertUser('did:plc:testuser123', null, null, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});
