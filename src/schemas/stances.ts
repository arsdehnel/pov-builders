import { z } from 'zod';
import { requiredString } from './utils';

const hexColor = z
	.string()
	.trim()
	.transform(v => (v.startsWith('#') ? v : `#${v}`))
	.pipe(z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid 6-digit hex color code (e.g. #ff0000)'));

const sharedFields = {
	slug: requiredString('Slug', 63),
	label: requiredString('Label', 255),
	color: hexColor,
	description: requiredString('Description'),
	example: requiredString('Example'),
	characterName: requiredString('Character name', 255),
	characterTagline: requiredString('Character tagline', 255),
	characterBio: requiredString('Character bio'),
	order: z.number().int().min(0),
};

const formSchema = z.object({
	id: z.string().uuid().optional(), // Present for update, absent for create
	...sharedFields,
});

const apiInsertSchema = z.object({ ...sharedFields });

const apiUpdateSchema = z.object({ ...sharedFields });

export const stancesSchemas = {
	form: formSchema,
	apiInsert: apiInsertSchema,
	apiUpdate: apiUpdateSchema,
};
