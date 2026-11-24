import { defineRelations } from 'drizzle-orm';
import { apiKeys } from './api-keys';
import { stances } from './stances';
import { topics } from './topics';
import { users } from './users';
import { values } from './values';
import { viewValues } from './view-values';
import { views } from './views';

export default defineRelations({ topics, values, stances, users, apiKeys, views, viewValues }, r => ({
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
	views: {
		user: r.one.users({
			from: r.views.userId,
			to: r.users.id,
			optional: false,
		}),
		topic: r.one.topics({
			from: r.views.topicId,
			to: r.topics.id,
			optional: false,
		}),
		overallStance: r.one.stances({
			from: r.views.overallStanceId,
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
	viewValues: {
		view: r.one.views({
			from: r.viewValues.viewId,
			to: r.views.id,
			optional: false,
		}),
		value: r.one.values({
			from: r.viewValues.valueId,
			to: r.values.id,
			optional: false,
		}),
		stance: r.one.stances({
			from: r.viewValues.stanceId,
			to: r.stances.id,
			optional: false,
		}),
	},
}));
