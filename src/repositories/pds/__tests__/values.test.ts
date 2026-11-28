import { MissingAtpRecordError, RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AtpOperationError } from '@/repositories/errors';
import {
	makeSpyLogger,
	makeTopicRow,
	makeValueRow,
	TEST_ATP_CID,
	TEST_ATP_RESPONSE,
	TEST_ATP_URI,
	TEST_ATP_URI_VALUE,
} from './helpers';

const { mockGetTopicById, mockGetServicePdsClient } = vi.hoisted(() => ({
	mockGetTopicById: vi.fn(),
	mockGetServicePdsClient: vi.fn(),
}));

vi.mock('@/repositories/d1', () => ({
	getTopicById: mockGetTopicById,
}));

vi.mock('../clients', () => ({
	getServicePdsClient: mockGetServicePdsClient,
}));

import { syncValueAtpRecord } from '../values';

function makePdsClient(overrides?: { createRecord?: ReturnType<typeof vi.fn>; putRecord?: ReturnType<typeof vi.fn> }) {
	return {
		createRecord: overrides?.createRecord ?? vi.fn().mockResolvedValue(TEST_ATP_RESPONSE),
		putRecord: overrides?.putRecord ?? vi.fn().mockResolvedValue(TEST_ATP_RESPONSE),
	};
}

beforeEach(() => {
	mockGetTopicById.mockReset();
	mockGetServicePdsClient.mockReset();

	// Default: topic exists and has an ATP record
	mockGetTopicById.mockResolvedValue(makeTopicRow({ atpUri: TEST_ATP_URI, atpCid: TEST_ATP_CID }));
	mockGetServicePdsClient.mockResolvedValue(makePdsClient());
});

describe('syncValueAtpRecord', () => {
	it('throws MissingAtpRecordError when the topic has no ATP record', async () => {
		mockGetTopicById.mockResolvedValue(makeTopicRow({ atpUri: null, atpCid: null }));
		await expect(syncValueAtpRecord(makeValueRow(), createNoopLogger())).rejects.toBeInstanceOf(MissingAtpRecordError);
	});

	it('logs warn before throwing MissingAtpRecordError', async () => {
		mockGetTopicById.mockResolvedValue(makeTopicRow({ atpUri: null, atpCid: null }));
		const logger = makeSpyLogger();
		await expect(syncValueAtpRecord(makeValueRow(), logger)).rejects.toThrow();
		expect(logger.warn).toHaveBeenCalled();
	});

	it('calls createRecord when the value has no existing atpUri', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		await syncValueAtpRecord(makeValueRow({ atpUri: null }), createNoopLogger());

		expect(client.createRecord).toHaveBeenCalledOnce();
		expect(client.putRecord).not.toHaveBeenCalled();
	});

	it('calls putRecord when the value already has an atpUri', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		await syncValueAtpRecord(makeValueRow({ atpUri: TEST_ATP_URI_VALUE, atpCid: TEST_ATP_CID }), createNoopLogger());

		expect(client.putRecord).toHaveBeenCalledOnce();
		expect(client.createRecord).not.toHaveBeenCalled();
	});

	it('returns uri and cid from the PDS response', async () => {
		const result = await syncValueAtpRecord(makeValueRow({ atpUri: null }), createNoopLogger());
		expect(result).toEqual({ uri: TEST_ATP_URI, cid: TEST_ATP_CID });
	});

	it('calls logger.debug at the start and logger.info on success', async () => {
		const logger = makeSpyLogger();
		await syncValueAtpRecord(makeValueRow(), logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('includes the topic ATP reference in the record sent to the PDS', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		await syncValueAtpRecord(makeValueRow({ atpUri: null }), createNoopLogger());

		const recordArg = client.createRecord.mock.calls[0][0];
		expect(recordArg.topic).toEqual({ uri: TEST_ATP_URI, cid: TEST_ATP_CID });
	});

	it('throws AtpOperationError and logs error when the PDS client throws', async () => {
		const logger = makeSpyLogger();
		mockGetServicePdsClient.mockRejectedValue(new Error('service unavailable'));

		await expect(syncValueAtpRecord(makeValueRow(), logger)).rejects.toBeInstanceOf(AtpOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('preserves XRPC metadata (atpStatus, atpError, retryable) on AtpOperationError', async () => {
		const xrpcLike = { status: 503, error: 'UpstreamFailure', shouldRetry: () => true };
		mockGetServicePdsClient.mockRejectedValue(xrpcLike);

		const err = await syncValueAtpRecord(makeValueRow(), createNoopLogger()).catch(e => e);
		expect(err).toBeInstanceOf(AtpOperationError);
		expect((err as AtpOperationError).atpStatus).toBe(503);
		expect((err as AtpOperationError).atpError).toBe('UpstreamFailure');
		expect((err as AtpOperationError).retryable).toBe(true);
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		// Topic missing ATP record
		mockGetTopicById.mockResolvedValue(makeTopicRow({ atpUri: null }));
		await expect(syncValueAtpRecord(makeValueRow(), createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);

		// PDS client failure
		mockGetTopicById.mockResolvedValue(makeTopicRow({ atpUri: TEST_ATP_URI, atpCid: TEST_ATP_CID }));
		mockGetServicePdsClient.mockRejectedValue(new Error('network error'));
		await expect(syncValueAtpRecord(makeValueRow(), createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});
