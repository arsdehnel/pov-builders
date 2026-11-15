import { z } from 'zod';
import { requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid().optional(), // Present for update, absent for create
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	order: z.number().int().min(0),
});

const apiInsertSchema = z.object({
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	order: z.number().int().min(0),
});

const apiUpdateSchema = z.object({
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	order: z.number().int().min(0),
});

export const stancesSchemas = {
	form: formSchema,
	apiInsert: apiInsertSchema,
	apiUpdate: apiUpdateSchema,
};
