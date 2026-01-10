import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid number'),
});

export const updateUserSchema = z.object({
  name: z.string().min(6).max(255).trim().optional(),
  email: z.string().email().max(255).toLowerCase().trim().optional(),
  role: z.enum(['user', 'admin']).optional(),
});
