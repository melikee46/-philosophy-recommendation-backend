import { z } from 'zod';

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('Geçerli bir soru ID olmalıdır'),
        selectedOptionId: z.string().uuid('Geçerli bir seçenek ID olmalıdır'),
      })
    )
    .min(1, 'En az bir soru yanıtlanmalıdır'),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
