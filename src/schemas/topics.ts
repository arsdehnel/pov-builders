import { z } from 'zod';
import { requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid().optional(), // Present for update, absent for create
	subdomain: requiredString('Subdomain', 63),
	title: requiredString('Title', 255),
});

const apiInsertSchema = z.object({
	subdomain: requiredString('Subdomain', 63),
	title: requiredString('Title', 255),
});

const apiUpdateSchema = z.object({
	subdomain: requiredString('Subdomain', 63),
	title: requiredString('Title', 255).optional(),
});

export const topicsSchemas = {
	form: formSchema,
	apiInsert: apiInsertSchema,
	apiUpdate: apiUpdateSchema,
};
