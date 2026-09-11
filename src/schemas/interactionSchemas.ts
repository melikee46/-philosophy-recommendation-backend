import { z } from 'zod';
import { InteractionStatus } from '@prisma/client';

const positiveInteger = z.coerce.number().int().positive();

export const upsertInteractionSchema = z.object({
  recommendationItemId: z.string().uuid('Geçerli bir öneri öğesi ID girilmelidir'),
  status: z.nativeEnum(InteractionStatus).default(InteractionStatus.SAVED),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const getMyLibraryQuerySchema = z.object({
  status: z.nativeEnum(InteractionStatus).optional(),
  philosophySlug: z.string().optional(),
  page: positiveInteger.default(1),
  limit: positiveInteger.max(100).default(20),
});

export const interactionItemIdParamSchema = z.object({
  itemId: z.string().uuid('Geçerli bir öneri öğesi ID girilmelidir'),
});

export type UpsertInteractionInput = z.infer<typeof upsertInteractionSchema>;
export type GetMyLibraryQuery = z.infer<typeof getMyLibraryQuerySchema>;
