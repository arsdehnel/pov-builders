import type { users } from '@/models';

export type UserDBRead = typeof users.$inferSelect;
