import crypto from 'node:crypto';
import { sql } from 'drizzle-orm';
import { type AnySQLiteColumn, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { stances } from './stances';
import { topics } from './topics';
import { users } from './users';

export const views = snakeCase.table(
	'views',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references((): AnySQLiteColumn => users.id),
		topicId: text()
			.notNull()
			.references((): AnySQLiteColumn => topics.id),
		label: text().notNull(),
		overallStanceId: text()
			.notNull()
			.references((): AnySQLiteColumn => stances.id),
		atpUri: text(),
		atpCid: text(),
		createdAt: text().notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
		createdBy: text().references((): AnySQLiteColumn => users.id),
		updatedAt: text(),
		updatedBy: text().references((): AnySQLiteColumn => users.id),
		deletedAt: text(),
		deletedBy: text().references((): AnySQLiteColumn => users.id),
	},
	table => [uniqueIndex('views_user_id_topic_id_label_unique').on(table.userId, table.topicId, table.label)],
);
