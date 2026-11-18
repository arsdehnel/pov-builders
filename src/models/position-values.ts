import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { positions } from './positions';
import { stances } from './stances';
import { users } from './users';
import { values } from './values';

export const positionValues = snakeCase.table(
	'position_values',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		positionId: text()
			.notNull()
			.references((): AnySQLiteColumn => positions.id),
		valueId: text()
			.notNull()
			.references((): AnySQLiteColumn => values.id),
		stanceId: text()
			.notNull()
			.references((): AnySQLiteColumn => stances.id),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [uniqueIndex('position_values_position_id_value_id_unique').on(table.positionId, table.valueId)],
);
