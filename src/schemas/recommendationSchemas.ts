import { z } from 'zod';
import { ItemType, DifficultyLevel } from '@prisma/client';

export const recommendationPackQuerySchema = z.object({
  philosophy: z.string().min(1, 'Felsefi akım slug veya ID gereklidir'),
  level: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.BEGINNER),
});

export const createRecommendationItemSchema = z.object({
  title: z.string().min(1, 'Başlık zorunludur').max(200),
  type: z.nativeEnum(ItemType),
  creator: z.string().min(1, 'Yazar/Yönetmen bilgisi zorunludur').max(150),
  releaseYear: z.number().int().min(0).max(2100),
  summary: z.string().min(10, 'Özet en az 10 karakter olmalıdır'),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  philosophyId: z.string().uuid('Geçerli bir felsefe ID girilmelidir'),
});

export const updateRecommendationItemSchema = createRecommendationItemSchema.partial();

export const filterRecommendationsQuerySchema = z.object({
  philosophySlug: z.string().optional(),
  type: z.nativeEnum(ItemType).optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  search: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20)),
});

export type RecommendationPackQuery = z.infer<typeof recommendationPackQuerySchema>;
export type CreateRecommendationItemInput = z.infer<typeof createRecommendationItemSchema>;
export type UpdateRecommendationItemInput = z.infer<typeof updateRecommendationItemSchema>;
export type FilterRecommendationsQuery = z.infer<typeof filterRecommendationsQuerySchema>;
