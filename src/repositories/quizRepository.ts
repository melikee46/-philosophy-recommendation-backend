import { prisma } from '../config/prisma';

export class QuizRepository {
  async getActiveQuestions() {
    return prisma.philosophyQuizQuestion.findMany({
      orderBy: { orderNumber: 'asc' },
      select: {
        id: true,
        orderNumber: true,
        question: true,
        description: true,
        options: {
          orderBy: { orderNumber: 'asc' },
          select: {
            id: true,
            orderNumber: true,
            optionText: true,
          },
        },
      },
    });
  }

  async getOptionsWithScores(optionIds: string[]) {
    return prisma.philosophyQuizOption.findMany({
      where: {
        id: { in: optionIds },
      },
      include: {
        scores: {
          include: {
            philosophy: {
              select: {
                id: true,
                name: true,
                slug: true,
                era: true,
                description: true,
                coreTenets: true,
              },
            },
          },
        },
      },
    });
  }
}
