import { RecommendationItem, ItemType, DifficultyLevel, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateRecommendationItemInput, UpdateRecommendationItemInput } from '../schemas/recommendationSchemas';

export class RecommendationRepository {
  async findById(id: string) {
    return prisma.recommendationItem.findUnique({
      where: { id },
      include: {
        philosophy: {
          select: { id: true, name: true, slug: true, era: true },
        },
      },
    });
  }

  async findItemsForPack(
    philosophyId: string,
    difficultyLevel: DifficultyLevel,
    type: ItemType
  ): Promise<RecommendationItem[]> {
    return prisma.recommendationItem.findMany({
      where: {
        philosophyId,
        type,
        difficultyLevel,
      },
    });
  }

  // Fallback if specific difficulty level item is not found
  async findFallbackItemsByType(philosophyId: string, type: ItemType): Promise<RecommendationItem[]> {
    return prisma.recommendationItem.findMany({
      where: {
        philosophyId,
        type,
      },
      orderBy: { difficultyLevel: 'asc' },
    });
  }

  async findFiltered(params: {
    philosophyId?: string;
    type?: ItemType;
    difficultyLevel?: DifficultyLevel;
    search?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.RecommendationItemWhereInput = {
      ...(params.philosophyId && { philosophyId: params.philosophyId }),
      ...(params.type && { type: params.type }),
      ...(params.difficultyLevel && { difficultyLevel: params.difficultyLevel }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { creator: { contains: params.search, mode: 'insensitive' } },
          { summary: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.recommendationItem.findMany({
        where,
        include: {
          philosophy: {
            select: { id: true, name: true, slug: true },
          },
        },
        skip: params.skip,
        take: params.take,
        orderBy: [{ philosophy: { name: 'asc' } }, { title: 'asc' }],
      }),
      prisma.recommendationItem.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: CreateRecommendationItemInput): Promise<RecommendationItem> {
    return prisma.recommendationItem.create({
      data,
    });
  }

  async update(id: string, data: UpdateRecommendationItemInput): Promise<RecommendationItem> {
    return prisma.recommendationItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<RecommendationItem> {
    return prisma.recommendationItem.delete({
      where: { id },
    });
  }

  async getRandomItemForPhilosophy(philosophyId: string, type: ItemType): Promise<RecommendationItem | null> {
    const count = await prisma.recommendationItem.count({
      where: { philosophyId, type },
    });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    return prisma.recommendationItem.findFirst({
      where: { philosophyId, type },
      skip,
    });
  }
}
