import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, index, snakeCase, text } from 'drizzle-orm/sqlite-core';
import type { Permission } from '../types/permissions';
import { users } from './users';

export const apiKeys = snakeCase.table(
	'api_keys',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references((): AnySQLiteColumn => users.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		permissions: text({ mode: 'json' }).$type<Permission[]>().notNull().default([]),
		revokeAt: text().notNull(),
		apiKey: text()
			.notNull()
			.$defaultFn(() => `sb_std_${crypto.randomBytes(32).toString('hex')}`),
		createdAt: text().notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [index('api_keys_user_id_idx').on(table.userId)],
);
