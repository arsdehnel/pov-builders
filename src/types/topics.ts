import type { z } from 'zod';
import type { topics } from '@/models';
import type { topicsSchemas } from '@/schemas';

export type TopicDBRead = typeof topics.$inferSelect;
export type TopicFormInput = z.input<typeof topicsSchemas.form>;
