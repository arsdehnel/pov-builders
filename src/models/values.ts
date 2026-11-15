import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { topics } from './topics';
import { users } from './users';

export const values = snakeCase.table(
	'values',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		topicId: integer()
			.notNull()
			.references((): AnySQLiteColumn => topics.id),
		slug: text().notNull(),
		label: text().notNull(),
		description: text().notNull(),
		order: integer().notNull(),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [uniqueIndex('values_order_unique').on(table.order)],
);
