import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { stances } from './stances';
import { users } from './users';
import { values } from './values';
import { views } from './views';

export const viewValues = snakeCase.table(
	'view_values',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		viewId: text()
			.notNull()
			.references((): AnySQLiteColumn => views.id, { onDelete: 'cascade' }),
		valueId: text()
			.notNull()
			.references((): AnySQLiteColumn => values.id, { onDelete: 'cascade' }),
		stanceId: text()
			.notNull()
			.references((): AnySQLiteColumn => stances.id, { onDelete: 'cascade' }),
		createdAt: text().notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [uniqueIndex('view_values_view_id_value_id_unique').on(table.viewId, table.valueId)],
);
