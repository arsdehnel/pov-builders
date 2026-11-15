import type { z } from 'zod';
import type { values } from '@/models';
import type { valuesSchemas } from '@/schemas';

export type ValueDBRead = typeof values.$inferSelect;
export type ValueFormInput = z.input<typeof valuesSchemas.form>;
