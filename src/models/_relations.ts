import { defineRelations } from 'drizzle-orm';
import { topics } from './topics';
import { values } from './values';

export default defineRelations({ topics, values }, r => ({
	topics: {
		values: r.many.values({
			from: r.topics.id,
			to: r.values.topicId,
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
}));
