import { InteractionRepository } from '../repositories/interactionRepository';
import { RecommendationRepository } from '../repositories/recommendationRepository';
import { ApiError } from '../utils/apiError';
import { UpsertInteractionInput, GetMyLibraryQuery } from '../schemas/interactionSchemas';

export class InteractionService {
  constructor(
    private interactionRepository: InteractionRepository = new InteractionRepository(),
    private recommendationRepository: RecommendationRepository = new RecommendationRepository()
  ) {}

  async upsertInteraction(userId: string, input: UpsertInteractionInput) {
    const item = await this.recommendationRepository.findById(input.recommendationItemId);
    if (!item) {
      throw ApiError.notFound('Etkileşim kurulmak istenen öneri öğesi bulunamadı');
    }

    return this.interactionRepository.upsert({
      userId,
      recommendationItemId: input.recommendationItemId,
      status: input.status,
      rating: input.rating,
      notes: input.notes,
    });
  }

  async getUserLibrary(userId: string, query: GetMyLibraryQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const { interactions, total } = await this.interactionRepository.findUserLibrary({
      userId,
      status: query.status,
      philosophySlug: query.philosophySlug,
      skip,
      take: limit,
    });

    return {
      interactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async removeInteraction(userId: string, recommendationItemId: string) {
    try {
      return await this.interactionRepository.delete(userId, recommendationItemId);
    } catch {
      throw ApiError.notFound('Kütüphanenizde bu öğeye ait bir kayıt bulunamadı');
    }
  }

  async getUserStats(userId: string) {
    return this.interactionRepository.getUserStats(userId);
  }
}
