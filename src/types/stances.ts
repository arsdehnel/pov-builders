import type { z } from 'zod';
import type { stances } from '@/models';
import type { stancesSchemas } from '@/schemas';

export type StanceDBRead = typeof stances.$inferSelect;
export type StanceFormInput = z.input<typeof stancesSchemas.form>;
