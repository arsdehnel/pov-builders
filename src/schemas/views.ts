import { z } from 'zod';

const apiUpsertSchema = z.object({
	topicId: z.string().uuid(),
	overallStanceId: z.string().uuid(),
});

export const viewsSchemas = {
	apiUpsert: apiUpsertSchema,
};
