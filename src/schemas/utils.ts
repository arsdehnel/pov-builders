import { z } from 'zod';

export const requiredString = (field: string, max?: number): z.ZodString => {
	const base = z.string().trim().min(1, `${field} is required`);
	return max !== undefined ? base.max(max, `${field} must be ${max} characters or less`) : base;
};
