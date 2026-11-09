import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const topics = snakeCase.table(
	'topics',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		subdomain: text().notNull(),
		title: text().notNull(),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.did),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.did),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.did),
	},
	table => [uniqueIndex('topics_subdomain_unique').on(table.subdomain)],
);
