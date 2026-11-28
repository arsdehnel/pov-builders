import { vi } from 'vitest';
import type { StanceDBRead, TopicDBRead, ValueDBRead } from '@/types';

export const TEST_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const TEST_TOPIC_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
export const TEST_USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
export const TEST_ATP_URI = `at://did:plc:test/builders.pov.topic/rkey123`;
export const TEST_ATP_URI_STANCE = `at://did:plc:test/builders.pov.stance/rkey456`;
export const TEST_ATP_URI_VALUE = `at://did:plc:test/builders.pov.value/rkey789`;
export const TEST_ATP_CID = 'bafyreib3testcid';
export const TEST_ATP_RESPONSE = { body: { uri: TEST_ATP_URI, cid: TEST_ATP_CID } };

export function makeTopicRow(overrides?: Partial<TopicDBRead>): TopicDBRead {
	return {
		id: TEST_TOPIC_ID,
		subdomain: 'test-topic',
		title: 'Test Topic',
		atpUri: null,
		atpCid: null,
		createdAt: '2024-01-01T00:00:00Z',
		createdBy: TEST_USER_ID,
		updatedAt: null,
		updatedBy: null,
		deletedAt: null,
		deletedBy: null,
		...overrides,
	};
}

export function makeStanceRow(overrides?: Partial<StanceDBRead>): StanceDBRead {
	return {
		id: TEST_ID,
		topicId: TEST_TOPIC_ID,
		slug: 'test-stance',
		label: 'Test Stance',
		icon: 'circle',
		color: '#ff0000',
		description: 'A test stance',
		example: 'An example',
		characterName: 'Test Character',
		characterTagline: 'A tagline',
		characterBio: 'A bio',
		order: 0,
		atpUri: null,
		atpCid: null,
		createdAt: '2024-01-01T00:00:00Z',
		createdBy: TEST_USER_ID,
		updatedAt: null,
		updatedBy: null,
		deletedAt: null,
		deletedBy: null,
		...overrides,
	};
}

export function makeValueRow(overrides?: Partial<ValueDBRead>): ValueDBRead {
	return {
		id: TEST_ID,
		topicId: TEST_TOPIC_ID,
		slug: 'test-value',
		label: 'Test Value',
		description: 'A test value',
		order: 0,
		atpUri: null,
		atpCid: null,
		createdAt: '2024-01-01T00:00:00Z',
		createdBy: TEST_USER_ID,
		updatedAt: null,
		updatedBy: null,
		deletedAt: null,
		deletedBy: null,
		...overrides,
	};
}

export function makeSpyLogger() {
	return {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		child: vi.fn().mockReturnThis(),
	};
}
