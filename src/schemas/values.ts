import { z } from 'zod';
import { requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid().optional(), // Present for update, absent for create
	topicId: z.string().uuid(),
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	description: requiredString('Description'),
	order: z.number().int().min(0),
});

const apiInsertSchema = z.object({
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	description: requiredString('Description'),
	order: z.number().int().min(0),
});

const apiUpdateSchema = z.object({
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	description: requiredString('Description'),
	order: z.number().int().min(0),
});

export const valuesSchemas = {
	form: formSchema,
	apiInsert: apiInsertSchema,
	apiUpdate: apiUpdateSchema,
};
