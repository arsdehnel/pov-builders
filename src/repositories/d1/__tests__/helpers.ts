import { vi } from 'vitest';
import type { StanceDBRead, TopicDBRead, UserDBRead, ValueDBRead } from '@/types';

export const TEST_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const TEST_ID_2 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
export const TEST_TOPIC_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
export const TEST_USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

export function makeTopicRow(overrides?: Partial<TopicDBRead>): TopicDBRead {
	return {
		id: TEST_ID,
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

export function makeUserRow(overrides?: Partial<UserDBRead>): UserDBRead {
	return {
		id: TEST_USER_ID,
		did: 'did:plc:testuser123',
		handle: 'test.bsky.social',
		role: 'BASIC',
		createdAt: '2024-01-01T00:00:00Z',
		createdBy: null,
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
