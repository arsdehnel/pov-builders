import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, index, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { topics } from './topics';
import { users } from './users';

export const stances = snakeCase.table(
	'stances',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		topicId: text()
			.notNull()
			.references((): AnySQLiteColumn => topics.id),
		slug: text().notNull(),
		label: text().notNull(),
		order: integer().notNull(),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [
		uniqueIndex('stances_topic_id_slug_unique').on(table.topicId, table.slug),
		index('stances_topic_id_order_idx').on(table.topicId, table.order),
	],
);
