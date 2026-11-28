import { InvalidUUIDError, NoRecordFoundError, RepositoryError, TooManyRecordsFoundError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseOperationError } from '@/repositories/errors';
import { makeSpyLogger, makeStanceRow, TEST_ID, TEST_ID_2, TEST_TOPIC_ID, TEST_USER_ID } from './helpers';

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

import { createStance, deleteStance, getStanceById, getStancesByTopicId, setStanceAtpRecord, updateStance } from '../stances';

beforeEach(() => {
	selectFn.mockReset();
	insertFn.mockReset();
	updateFn.mockReset();
});

describe('getStancesByTopicId', () => {
	it('throws InvalidUUIDError for a non-UUID topicId without touching the DB', async () => {
		await expect(getStancesByTopicId('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns stances for a valid topicId', async () => {
		const stance = makeStanceRow();
		selectFn.mockResolvedValue([stance]);
		expect(await getStancesByTopicId(TEST_TOPIC_ID, createNoopLogger())).toEqual([stance]);
	});

	it('returns an empty array when the topic has no stances', async () => {
		selectFn.mockResolvedValue([]);
		expect(await getStancesByTopicId(TEST_TOPIC_ID, createNoopLogger())).toEqual([]);
	});

	it('calls logger.debug', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await getStancesByTopicId(TEST_TOPIC_ID, logger);
		expect(logger.debug).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getStancesByTopicId(TEST_TOPIC_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		// Invalid topicId
		await expect(getStancesByTopicId('bad-id', createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
		// DB failure
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getStancesByTopicId(TEST_TOPIC_ID, createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});

describe('getStanceById', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(getStanceById('not-a-uuid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
		expect(selectFn).not.toHaveBeenCalled();
	});

	it('returns the matching stance', async () => {
		const stance = makeStanceRow();
		selectFn.mockResolvedValue([stance]);
		expect(await getStanceById(TEST_ID, createNoopLogger())).toEqual(stance);
	});

	it('throws NoRecordFoundError when nothing is returned', async () => {
		selectFn.mockResolvedValue([]);
		await expect(getStanceById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws TooManyRecordsFoundError when multiple rows are returned', async () => {
		selectFn.mockResolvedValue([makeStanceRow(), makeStanceRow({ id: TEST_ID_2 })]);
		await expect(getStanceById(TEST_ID, createNoopLogger())).rejects.toBeInstanceOf(TooManyRecordsFoundError);
	});

	it('logs warn before throwing NoRecordFoundError', async () => {
		const logger = makeSpyLogger();
		selectFn.mockResolvedValue([]);
		await expect(getStanceById(TEST_ID, logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError and logs error when DB throws', async () => {
		const logger = makeSpyLogger();
		selectFn.mockRejectedValue(new Error('DB error'));
		await expect(getStanceById(TEST_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('createStance', () => {
	const data = {
		topicId: TEST_TOPIC_ID,
		slug: 'test-stance',
		label: 'Test Stance',
		icon: 'circle',
		color: '#ff0000',
		description: 'A test stance',
		example: 'An example',
		characterName: 'Test',
		characterTagline: 'Tagline',
		characterBio: 'Bio',
		order: 0,
	};

	it('returns the inserted stance', async () => {
		const stance = makeStanceRow();
		insertFn.mockResolvedValue([stance]);
		expect(await createStance(data, TEST_USER_ID, createNoopLogger())).toEqual(stance);
	});

	it('calls logger.debug and logger.info on success', async () => {
		const logger = makeSpyLogger();
		insertFn.mockResolvedValue([makeStanceRow()]);
		await createStance(data, TEST_USER_ID, logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('throws DatabaseOperationError when the DB throws (e.g. duplicate slug)', async () => {
		const logger = makeSpyLogger();
		insertFn.mockRejectedValue(new Error('UNIQUE constraint failed: stances.topic_id, stances.slug'));
		await expect(createStance(data, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('updateStance', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(updateStance('bad-id', {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated stance', async () => {
		const stance = makeStanceRow({ label: 'Updated' });
		updateFn.mockResolvedValue([stance]);
		expect(await updateStance(TEST_ID, { label: 'Updated' }, TEST_USER_ID, createNoopLogger())).toEqual(stance);
	});

	it('throws NoRecordFoundError when no rows are updated', async () => {
		updateFn.mockResolvedValue([]);
		await expect(updateStance(TEST_ID, {}, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(updateStance(TEST_ID, {}, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('setStanceAtpRecord', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(setStanceAtpRecord('bad-id', 'at://x', 'cid', createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the updated stance with ATP fields set', async () => {
		const stance = makeStanceRow({ atpUri: 'at://did/collection/rkey', atpCid: 'bafy' });
		updateFn.mockResolvedValue([stance]);
		const result = await setStanceAtpRecord(TEST_ID, 'at://did/collection/rkey', 'bafy', createNoopLogger());
		expect(result).toEqual(stance);
	});

	it('throws NoRecordFoundError when the stance does not exist or is deleted', async () => {
		updateFn.mockResolvedValue([]);
		await expect(setStanceAtpRecord(TEST_ID, 'at://x', 'cid', createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(setStanceAtpRecord(TEST_ID, 'at://x', 'cid', logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});

describe('deleteStance', () => {
	it('throws InvalidUUIDError for a non-UUID id', async () => {
		await expect(deleteStance('bad-id', TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(InvalidUUIDError);
	});

	it('returns the soft-deleted stance', async () => {
		const stance = makeStanceRow({ deletedAt: '2024-06-01T00:00:00Z' });
		updateFn.mockResolvedValue([stance]);
		expect(await deleteStance(TEST_ID, TEST_USER_ID, createNoopLogger())).toEqual(stance);
	});

	it('throws NoRecordFoundError when the stance does not exist', async () => {
		updateFn.mockResolvedValue([]);
		await expect(deleteStance(TEST_ID, TEST_USER_ID, createNoopLogger())).rejects.toBeInstanceOf(NoRecordFoundError);
	});

	it('throws DatabaseOperationError when DB throws', async () => {
		const logger = makeSpyLogger();
		updateFn.mockRejectedValue(new Error('DB error'));
		await expect(deleteStance(TEST_ID, TEST_USER_ID, logger)).rejects.toBeInstanceOf(DatabaseOperationError);
		expect(logger.error).toHaveBeenCalled();
	});
});
