import { z } from 'zod';

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('Geçerli bir soru ID olmalıdır'),
        selectedOptionId: z.string().uuid('Geçerli bir seçenek ID olmalıdır'),
      })
    )
    .min(1, 'En az bir soru yanıtlanmalıdır')
    .max(50, 'En fazla 50 soru yanıtlanabilir'),
}).superRefine(({ answers }, context) => {
  const questionIds = new Set<string>();
  const optionIds = new Set<string>();

  answers.forEach((answer, index) => {
    if (questionIds.has(answer.questionId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answers', index, 'questionId'],
        message: 'Her soru yalnızca bir kez yanıtlanabilir',
      });
    }
    questionIds.add(answer.questionId);

    if (optionIds.has(answer.selectedOptionId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answers', index, 'selectedOptionId'],
        message: 'Bir seçenek yalnızca bir kez kullanılabilir',
      });
    }
    optionIds.add(answer.selectedOptionId);
  });
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
