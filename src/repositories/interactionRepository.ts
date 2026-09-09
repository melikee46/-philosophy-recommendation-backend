import { UserInteraction, InteractionStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export class InteractionRepository {
  async upsert(params: {
    userId: string;
    recommendationItemId: string;
    status: InteractionStatus;
    rating?: number | null;
    notes?: string | null;
  }): Promise<UserInteraction> {
    const { userId, recommendationItemId, status, rating, notes } = params;

    return prisma.userInteraction.upsert({
      where: {
        userId_recommendationItemId: {
          userId,
          recommendationItemId,
        },
      },
      create: {
        userId,
        recommendationItemId,
        status,
        rating,
        notes,
      },
      update: {
        status,
        ...(rating !== undefined && { rating }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        recommendationItem: {
          include: {
            philosophy: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  async findUserLibrary(params: {
    userId: string;
    status?: InteractionStatus;
    philosophySlug?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.UserInteractionWhereInput = {
      userId: params.userId,
      ...(params.status && { status: params.status }),
      ...(params.philosophySlug && {
        recommendationItem: {
          philosophy: {
            slug: params.philosophySlug,
          },
        },
      }),
    };

    const [interactions, total] = await Promise.all([
      prisma.userInteraction.findMany({
        where,
        include: {
          recommendationItem: {
            include: {
              philosophy: {
                select: { id: true, name: true, slug: true, era: true },
              },
            },
          },
        },
        skip: params.skip,
        take: params.take,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.userInteraction.count({ where }),
    ]);

    return { interactions, total };
  }

  async delete(userId: string, recommendationItemId: string): Promise<UserInteraction> {
    return prisma.userInteraction.delete({
      where: {
        userId_recommendationItemId: {
          userId,
          recommendationItemId,
        },
      },
    });
  }

  async getUserStats(userId: string) {
    const interactions = await prisma.userInteraction.findMany({
      where: { userId },
      include: {
        recommendationItem: {
          select: {
            type: true,
            philosophy: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    const statusCounts: Record<InteractionStatus, number> = {
      SAVED: 0,
      COMPLETED: 0,
      DROPPED: 0,
    };

    let totalRating = 0;
    let ratedCount = 0;
    const philosophyCounts: Record<string, number> = {};

    for (const item of interactions) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      if (item.rating) {
        totalRating += item.rating;
        ratedCount += 1;
      }
      const pName = item.recommendationItem.philosophy.name;
      philosophyCounts[pName] = (philosophyCounts[pName] || 0) + 1;
    }

    return {
      totalInteractions: interactions.length,
      statusCounts,
      averageRating: ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : null,
      ratedItemsCount: ratedCount,
      philosophyBreakdown: philosophyCounts,
    };
  }
}
