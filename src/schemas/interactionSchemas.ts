import { z } from 'zod';
import { InteractionStatus } from '@prisma/client';

export const upsertInteractionSchema = z.object({
  recommendationItemId: z.string().uuid('Geçerli bir öneri öğesi ID girilmelidir'),
  status: z.nativeEnum(InteractionStatus).default(InteractionStatus.SAVED),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const getMyLibraryQuerySchema = z.object({
  status: z.nativeEnum(InteractionStatus).optional(),
  philosophySlug: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20)),
});

export type UpsertInteractionInput = z.infer<typeof upsertInteractionSchema>;
export type GetMyLibraryQuery = z.infer<typeof getMyLibraryQuerySchema>;
