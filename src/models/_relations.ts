import { defineRelations } from 'drizzle-orm';
import { apiKeys } from './api-keys';
import { positionValues } from './position-values';
import { positions } from './positions';
import { stances } from './stances';
import { topics } from './topics';
import { users } from './users';
import { values } from './values';

export default defineRelations({ topics, values, stances, users, apiKeys, positions, positionValues }, r => ({
	topics: {
		values: r.many.values({
			from: r.topics.id,
			to: r.values.topicId,
			where: {
				deletedAt: { isNull: true },
			},
		}),
		stances: r.many.stances({
			from: r.topics.id,
			to: r.stances.topicId,
			where: {
				deletedAt: { isNull: true },
			},
		}),
	},
	values: {
		topic: r.one.topics({
			from: r.values.topicId,
			to: r.topics.id,
			optional: false,
		}),
	},
	stances: {
		topic: r.one.topics({
			from: r.stances.topicId,
			to: r.topics.id,
			optional: false,
		}),
	},
	positions: {
		user: r.one.users({
			from: r.positions.userId,
			to: r.users.id,
			optional: false,
		}),
		topic: r.one.topics({
			from: r.positions.topicId,
			to: r.topics.id,
			optional: false,
		}),
		overallStance: r.one.stances({
			from: r.positions.overallStanceId,
			to: r.stances.id,
			optional: false,
		}),
	},
	users: {
		apiKeys: r.many.apiKeys({
			from: r.users.id,
			to: r.apiKeys.userId,
			where: {
				deletedAt: { isNull: true },
			},
		}),
	},
	apiKeys: {
		user: r.one.users({
			from: r.apiKeys.userId,
			to: r.users.id,
			optional: false,
		}),
	},
	positionValues: {
		position: r.one.positions({
			from: r.positionValues.positionId,
			to: r.positions.id,
			optional: false,
		}),
		value: r.one.values({
			from: r.positionValues.valueId,
			to: r.values.id,
			optional: false,
		}),
		stance: r.one.stances({
			from: r.positionValues.stanceId,
			to: r.stances.id,
			optional: false,
		}),
	},
}));
