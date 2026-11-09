import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { userDbRecordRoles } from '@/data/roles';

export const users = snakeCase.table(
	'users',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		did: text().primaryKey(),
		handle: text(),
		role: text({ enum: userDbRecordRoles }).default('BASIC').notNull(),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.did),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.did),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.did),
	},
	table => [uniqueIndex('users_did_idx').on(table.did)],
);
