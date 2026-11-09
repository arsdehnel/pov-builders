import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { topics } from './topics';
import { users } from './users';

export const values = snakeCase.table(
	'values',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		topicId: text()
			.notNull()
			.references((): AnySQLiteColumn => topics.id),

		label: text().notNull(),
		description: text().notNull(),
		order: integer().notNull(),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.did),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.did),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.did),
	},
	table => [uniqueIndex('values_order_unique').on(table.order)],
);
