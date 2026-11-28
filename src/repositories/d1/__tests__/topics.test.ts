import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseOperationError } from '@/repositories/errors';
import { makeSpyLogger, makeTopicRow, TEST_ID, TEST_ID_2, TEST_USER_ID } from './helpers';

const { selectFn, insertFn, updateFn } = vi.hoisted(() => ({
	selectFn: vi.fn(),
	insertFn: vi.fn(),
	updateFn: vi.fn(),
}));

vi.mock('@/db', () => ({
	default: {
		select: () => ({ from: () => ({ where: selectFn }) }),
		insert: () => ({ values: () => ({ returning: insertFn }) }),
		update: () => ({ set: () => ({ where: () => ({ returning: updateFn }) }) }),
	},
}));

import {
	createTopic,
	deleteTopic,
	getTopicById,
	getTopicBySubdomain,
	getTopics,
	setTopicAtpRecord,
	updateTopic,
} from '../topics';

beforeEach(() => {
	selectFn.mockReset();
	insertFn.mockReset();
	updateFn.mockReset();
});

describe('getTopics', () => {
	it('returns the array the DB gives back', async () => {
		const topic = makeTopicRow();
		selectFn.mockResolvedValue([topic]);
		const result = await getTopics(createNoopLogger());
		expect(result).toEqual([topic]);
	});

	it('returns an empty array when no topics exist', async () => {
		selectFn.mockResolvedValue([]);
		expect(await getTopics(createNoopLogger())).toEqual([]);
	});

	it('calls logger.debug', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await getTopics(logger);
		expect(logger.debug).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('connection lost'));
		await expect(getTopics(logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getTopics(createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});

describe('getTopicById', () => {
	it('throws InvalidUUIDError for a non-UUID id without touching the DB', async () => {
		await expect(getTopicById('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns the matching topic', async () => {
		const topic = makeTopicRow();
		selectFn.mockResolvedValue([topic]);
		expect(await getTopicById(TEST_ID, createNoopLogger())).toEqual(topic);
	});

	it('throws NoRecordFoundError when nothing is returned from the DB', async () => {
		selectFn.mockResolvedValue([]);
		await expect(getTopicById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws TooManyRecordsFoundError when multiple rows are returned', async () => {
		selectFn.mockResolvedValue([makeTopicRow(), makeTopicRow({ id: TEST_ID_2 })]);
		await expect(getTopicById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(TooManyRecordsFoundError);
	});

	it('logs warn before throwing NoRecordFoundError', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await expect(getTopicById(TEST_ID, logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('logs warn before throwing TooManyRecordsFoundError', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([makeTopicRow(), makeTopicRow({ id: TEST_ID_2 })]);
		await expect(getTopicById(TEST_ID, logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getTopicById(TEST_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		// Invalid UUID
		await expect(getTopicById('bad-id', createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// Not found
		selectFn.mockResolvedValue([]);
		await expect(getTopicById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// DB failure
		selectFn.mockRejectedValue(new Error('connection dropped'));
		await expect(getTopicById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});

describe('getTopicBySubdomain', () => {
	it('returns the matching topic', async () => {
		const topic = makeTopicRow();
		selectFn.mockResolvedValue([topic]);
		expect(await getTopicBySubdomain('test-topic', createNoopLogger())).toEqual(topic);
	});

	it('throws NoRecordFoundError when no topic has that subdomain', async () => {
		selectFn.mockResolvedValue([]);
		await expect(getTopicBySubdomain('missing', createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws TooManyRecordsFoundError when subdomain is not unique', async () => {
		selectFn.mockResolvedValue([makeTopicRow(), makeTopicRow({ id: TEST_ID_2 })]);
		await expect(getTopicBySubdomain('test-topic', createNoopLogger())).rejects.toBeInstanceOf(TooManyRecordsFoundError);
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getTopicBySubdomain('test', logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('createTopic', () => {
	it('returns the inserted topic', async () => {
		const topic = makeTopicRow();
		insertFn.mockResolvedValue([topic]);
		const result = await createTopic({ subdomain: 'test-topic', title: 'Test Topic' }, TEST_USER_ID, createNoopLogger());
		expect(result).toEqual(topic);
	});

	it('calls logger.debug and logger.info on success', async () => {
		const logger = makeSpyLogger();
		insertFn.mockResolvedValue([makeTopicRow()]);
		await createTopic({ subdomain: 'test-topic', title: 'Test Topic' }, TEST_USER_ID, logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when the DB throws (e.g. duplicate subdomain)', async () => {
		const logger = makeSpyLogger();
		insertFn.mockRejectedValue(new Error('UNIQUE constraint failed: topics.subdomain'));
		await expect(createTopic({ subdomain: 'duplicate', title: 'Dup' }, TEST_USER_ID, logger)).rejects.toBeInstanceOf(
			DatabaseOperationError,
		);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: DB errors are wrapped in RepositoryError subclasses', async () => {
		insertFn.mockRejectedValue(new Error('some DB error'));
		await expect(createTopic({ subdomain: 'x', title: 'X' }, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(
			RepositoryError,
		);
	});
});

describe('updateTopic', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(updateTopic('bad-id', {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated topic', async () => {
		const topic = makeTopicRow({ title: 'Updated' });
		updateFn.mockResolvedValue([topic]);
		const result = await updateTopic(TEST_ID, { title: 'Updated' }, TEST_USER_ID, createNoopLogger());
		expect(result).toEqual(topic);
	});

	it('throws NoRecordFoundError when no rows are updated (record does not exist or is deleted)', async () => {
		updateFn.mockResolvedValue([]);
		await expect(updateTopic(TEST_ID, {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(updateTopic(TEST_ID, {}, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('setTopicAtpRecord', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(setTopicAtpRecord('bad-id', 'at://uri', 'cid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated topic with ATP fields set', async () => {
		const topic = makeTopicRow({ atpUri: 'at://did/collection/rkey', atpCid: 'bafy' });
		updateFn.mockResolvedValue([topic]);
		const result = await setTopicAtpRecord(TEST_ID, 'at://did/collection/rkey', 'bafy', createNoopLogger());
		expect(result).toEqual(topic);
	});

	it('throws NoRecordFoundError when the topic does not exist or is deleted', async () => {
		updateFn.mockResolvedValue([]);
		await expect(setTopicAtpRecord(TEST_ID, 'at://x', 'cid', createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(setTopicAtpRecord(TEST_ID, 'at://x', 'cid', logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('deleteTopic', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(deleteTopic('bad-id', TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the soft-deleted topic', async () => {
		const topic = makeTopicRow({ deletedAt: '2024-06-01T00:00:00Z' });
		updateFn.mockResolvedValue([topic]);
		const result = await deleteTopic(TEST_ID, TEST_USER_ID, createNoopLogger());
		expect(result).toEqual(topic);
	});

	it('throws NoRecordFoundError when the topic does not exist', async () => {
		updateFn.mockResolvedValue([]);
		await expect(deleteTopic(TEST_ID, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(deleteTopic(TEST_ID, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	// Note: deleteTopic does NOT filter by isNull(deletedAt) in its WHERE clause, which means
	// calling it on an already-deleted topic will update deletedAt again. This is current
	// behaviour — if idempotent deletes are not needed, add isNull(topics.deletedAt) to
	// the WHERE clause and expect NoRecordFoundError for already-deleted topics.
	it('succeeds when called on an already-deleted topic (idempotent re-delete)', async () => {
		const topic = makeTopicRow({ deletedAt: '2024-01-01T00:00:00Z' });
		updateFn.mockResolvedValue([topic]);
		await expect(deleteTopic(TEST_ID, TEST_USER_ID, createNoopLogger())).resolves.toEqual(topic);
	});
});
