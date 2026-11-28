import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseOperationError } from '@/repositories/errors';
import { makeSpyLogger, makeValueRow, TEST_ID, TEST_ID_2, TEST_TOPIC_ID, TEST_USER_ID } from './helpers';

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

import { createValue, deleteValue, getValueById, getValuesByTopicId, setValueAtpRecord, updateValue } from '../values';

beforeEach(() => {
	selectFn.mockReset();
	insertFn.mockReset();
	updateFn.mockReset();
});

describe('getValuesByTopicId', () => {
	it('throws InvalidUUIDError for a non-UUID topicId without touching the DB', async () => {
		await expect(getValuesByTopicId('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns values for a valid topicId', async () => {
		const value = makeValueRow();
		selectFn.mockResolvedValue([value]);
		expect(await getValuesByTopicId(TEST_TOPIC_ID, createNoopLogger())).toEqual([value]);
	});

	it('returns an empty array when the topic has no values', async () => {
		selectFn.mockResolvedValue([]);
		expect(await getValuesByTopicId(TEST_TOPIC_ID, createNoopLogger())).toEqual([]);
	});

	it('calls logger.debug', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await getValuesByTopicId(TEST_TOPIC_ID, logger);
		expect(logger.debug).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getValuesByTopicId(TEST_TOPIC_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		await expect(getValuesByTopicId('bad-id', createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getValuesByTopicId(TEST_TOPIC_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});

describe('getValueById', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(getValueById('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns the matching value', async () => {
		const value = makeValueRow();
		selectFn.mockResolvedValue([value]);
		expect(await getValueById(TEST_ID, createNoopLogger())).toEqual(value);
	});

	it('throws NoRecordFoundError when nothing is returned', async () => {
		selectFn.mockResolvedValue([]);
		await expect(getValueById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws TooManyRecordsFoundError when multiple rows are returned', async () => {
		selectFn.mockResolvedValue([makeValueRow(), makeValueRow({ id: TEST_ID_2 })]);
		await expect(getValueById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(TooManyRecordsFoundError);
	});

	it('logs warn before throwing NoRecordFoundError', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await expect(getValueById(TEST_ID, logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getValueById(TEST_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('createValue', () => {
	const data = {
		topicId: TEST_TOPIC_ID,
		slug: 'test-value',
		label: 'Test Value',
		description: 'A test value',
		order: 0,
	};

	it('returns the inserted value', async () => {
		const value = makeValueRow();
		insertFn.mockResolvedValue([value]);
		expect(await createValue(data, TEST_USER_ID, createNoopLogger())).toEqual(value);
	});

	it('calls logger.debug and logger.info on success', async () => {
		const logger = makeSpyLogger();
		insertFn.mockResolvedValue([makeValueRow()]);
		await createValue(data, TEST_USER_ID, logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError when the DB throws (e.g. duplicate slug)', async () => {
		const logger = makeSpyLogger();
		insertFn.mockRejectedValue(new Error('UNIQUE constraint failed: values.topic_id, values.slug'));
		await expect(createValue(data, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('updateValue', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(updateValue('bad-id', {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated value', async () => {
		const value = makeValueRow({ label: 'Updated' });
		updateFn.mockResolvedValue([value]);
		expect(await updateValue(TEST_ID, { label: 'Updated' }, TEST_USER_ID, createNoopLogger())).toEqual(value);
	});

	it('throws NoRecordFoundError when no rows are updated', async () => {
		updateFn.mockResolvedValue([]);
		await expect(updateValue(TEST_ID, {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(updateValue(TEST_ID, {}, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('setValueAtpRecord', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(setValueAtpRecord('bad-id', 'at://x', 'cid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated value with ATP fields set', async () => {
		const value = makeValueRow({ atpUri: 'at://did/collection/rkey', atpCid: 'bafy' });
		updateFn.mockResolvedValue([value]);
		const result = await setValueAtpRecord(TEST_ID, 'at://did/collection/rkey', 'bafy', createNoopLogger());
		expect(result).toEqual(value);
	});

	it('throws NoRecordFoundError when the value does not exist or is deleted', async () => {
		updateFn.mockResolvedValue([]);
		await expect(setValueAtpRecord(TEST_ID, 'at://x', 'cid', createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(setValueAtpRecord(TEST_ID, 'at://x', 'cid', logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('deleteValue', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(deleteValue('bad-id', TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the soft-deleted value', async () => {
		const value = makeValueRow({ deletedAt: '2024-06-01T00:00:00Z' });
		updateFn.mockResolvedValue([value]);
		expect(await deleteValue(TEST_ID, TEST_USER_ID, createNoopLogger())).toEqual(value);
	});

	it('throws NoRecordFoundError when the value does not exist', async () => {
		updateFn.mockResolvedValue([]);
		await expect(deleteValue(TEST_ID, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(deleteValue(TEST_ID, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});
