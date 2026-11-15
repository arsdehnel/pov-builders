import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, index, integer, snakeCase, text } from 'drizzle-orm/sqlite-core';
import { topics } from './topics';
import { users } from './users';

export const stances = snakeCase.table(
	'stances',
	{
		id: integer().primaryKey({ autoIncrement: true }),
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
	table => [index('stances_order_unique').on(table.order)],
);
