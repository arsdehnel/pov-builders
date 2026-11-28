import { RepositoryError } from '@arsdehnel/rwsdk-atp/errors';
import { createNoopLogger } from '@arsdehnel/rwsdk-atp/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AtpOperationError } from '@/repositories/errors';
import { makeSpyLogger, makeTopicRow, TEST_ATP_CID, TEST_ATP_RESPONSE, TEST_ATP_URI } from './helpers';

const { mockGetServicePdsClient } = vi.hoisted(() => ({
	mockGetServicePdsClient: vi.fn(),
}));

vi.mock('../clients', () => ({
	getServicePdsClient: mockGetServicePdsClient,
}));

import { syncTopicAtpRecord } from '../topics';

function makePdsClient(overrides?: { createRecord?: ReturnType<typeof vi.fn>; putRecord?: ReturnType<typeof vi.fn> }) {
	return {
		createRecord: overrides?.createRecord ?? vi.fn().mockResolvedValue(TEST_ATP_RESPONSE),
		putRecord: overrides?.putRecord ?? vi.fn().mockResolvedValue(TEST_ATP_RESPONSE),
	};
}

beforeEach(() => {
	mockGetServicePdsClient.mockReset();
	mockGetServicePdsClient.mockResolvedValue(makePdsClient());
});

describe('syncTopicAtpRecord', () => {
	it('calls createRecord when the topic has no existing atpUri', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		const topic = makeTopicRow({ atpUri: null });
		await syncTopicAtpRecord(topic, createNoopLogger());

		expect(client.createRecord).toHaveBeenCalledOnce();
		expect(client.putRecord).not.toHaveBeenCalled();
	});

	it('calls putRecord when the topic already has an atpUri', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		const topic = makeTopicRow({ atpUri: TEST_ATP_URI, atpCid: TEST_ATP_CID });
		await syncTopicAtpRecord(topic, createNoopLogger());

		expect(client.putRecord).toHaveBeenCalledOnce();
		expect(client.createRecord).not.toHaveBeenCalled();
	});

	it('returns uri and cid from the PDS response', async () => {
		const topic = makeTopicRow({ atpUri: null });
		const result = await syncTopicAtpRecord(topic, createNoopLogger());
		expect(result).toEqual({ uri: TEST_ATP_URI, cid: TEST_ATP_CID });
	});

	it('calls logger.debug at the start and logger.info on success', async () => {
		const logger = makeSpyLogger();
		const topic = makeTopicRow({ atpUri: null });
		await syncTopicAtpRecord(topic, logger);
		expect(logger.debug).toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalled();
	});

	it('passes the rkey extracted from the existing atpUri to putRecord', async () => {
		const client = makePdsClient();
		mockGetServicePdsClient.mockResolvedValue(client);

		// atpUri format: at://<did>/<collection>/<rkey>
		const topic = makeTopicRow({ atpUri: 'at://did:plc:test/builders.pov.topic/myrkey', atpCid: TEST_ATP_CID });
		await syncTopicAtpRecord(topic, createNoopLogger());

		expect(client.putRecord).toHaveBeenCalledWith(expect.any(Object), 'myrkey');
	});

	it('throws AtpOperationError and logs error when the PDS client throws', async () => {
		const logger = makeSpyLogger();
		mockGetServicePdsClient.mockRejectedValue(new Error('service account not configured'));
		const topic = makeTopicRow({ atpUri: null });

		await expect(syncTopicAtpRecord(topic, logger)).rejects.toBeInstanceOf(AtpOperationError);
		expect(logger.error).toHaveBeenCalled();
	});

	it('preserves XRPC metadata (atpStatus, atpError, retryable) on AtpOperationError', async () => {
		const xrpcLike = { status: 429, error: 'RateLimitExceeded', shouldRetry: () => true };
		mockGetServicePdsClient.mockRejectedValue(xrpcLike);

		const err = await syncTopicAtpRecord(makeTopicRow({ atpUri: null }), createNoopLogger()).catch(e => e);
		expect(err).toBeInstanceOf(AtpOperationError);
		expect((err as AtpOperationError).atpStatus).toBe(429);
		expect((err as AtpOperationError).atpError).toBe('RateLimitExceeded');
		expect((err as AtpOperationError).retryable).toBe(true);
	});

	it('honours the convention: all throws are RepositoryError subclasses', async () => {
		mockGetServicePdsClient.mockRejectedValue(new Error('network error'));
		await expect(syncTopicAtpRecord(makeTopicRow(), createNoopLogger())).rejects.toBeInstanceOf(RepositoryError);
	});
});
