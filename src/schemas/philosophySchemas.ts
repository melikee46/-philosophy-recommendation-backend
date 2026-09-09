import { z } from 'zod';
import { DifficultyLevel } from '@prisma/client';

export const createPhilosophySchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(50, 'Slug en fazla 50 karakter olabilir')
    .regex(/^[a-z0-9-]+$/, 'Slug yalnızca küçük harfler, rakamlar ve tire içerebilir'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100),
  era: z.string().min(2, 'Dönem bilgisi gereklidir').max(100),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  coreTenets: z.array(z.string().min(2)).min(1, 'En az 1 ana ilke girilmelidir'),
});

export const updatePhilosophySchema = createPhilosophySchema.partial();

export const getPhilosophyQuerySchema = z.object({
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
});

export type CreatePhilosophyInput = z.infer<typeof createPhilosophySchema>;
export type UpdatePhilosophyInput = z.infer<typeof updatePhilosophySchema>;
export type GetPhilosophyQuery = z.infer<typeof getPhilosophyQuerySchema>;
