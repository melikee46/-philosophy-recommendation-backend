import { ItemType, DifficultyLevel, RecommendationItem, Philosophy } from '@prisma/client';
import { RecommendationRepository } from '../repositories/recommendationRepository';
import { PhilosophyRepository } from '../repositories/philosophyRepository';
import { ApiError } from '../utils/apiError';
import {
  CreateRecommendationItemInput,
  UpdateRecommendationItemInput,
  FilterRecommendationsQuery,
} from '../schemas/recommendationSchemas';

export interface DynamicPackResult {
  philosophy: {
    id: string;
    name: string;
    slug: string;
    era: string;
    coreTenets: string[];
    description: string;
  };
  requestedLevel: DifficultyLevel;
  pack: {
    book: RecommendationItem | null;
    movie: RecommendationItem | null;
    series: RecommendationItem | null;
  };
  hasCompletePack: boolean;
  notes: string;
}

export interface DailyPackResult {
  date: string;
  theme: string;
  dailyTenet: string;
  philosophy: {
    id: string;
    name: string;
    slug: string;
    era: string;
    description: string;
  };
  pack: {
    book: RecommendationItem | null;
    movie: RecommendationItem | null;
    series: RecommendationItem | null;
  };
}

export class RecommendationService {
  constructor(
    private recommendationRepository: RecommendationRepository = new RecommendationRepository(),
    private philosophyRepository: PhilosophyRepository = new PhilosophyRepository()
  ) {}

  private pickRandom<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  private async resolveItemForType(
    philosophyId: string,
    type: ItemType,
    level: DifficultyLevel
  ): Promise<RecommendationItem | null> {
    // 1. First attempt: exact match for philosophy and difficulty level
    const exactMatches = await this.recommendationRepository.findItemsForPack(philosophyId, level, type);
    if (exactMatches.length > 0) {
      return this.pickRandom(exactMatches);
    }

    // 2. Fallback: match any difficulty level for this philosophy
    const fallbackMatches = await this.recommendationRepository.findFallbackItemsByType(philosophyId, type);
    return this.pickRandom(fallbackMatches);
  }

  async getDynamicPack(philosophySlugOrId: string, level: DifficultyLevel): Promise<DynamicPackResult> {
    // Find philosophy by slug or UUID
    let philosophy = await this.philosophyRepository.findBySlug(philosophySlugOrId);
    if (!philosophy) {
      philosophy = (await this.philosophyRepository.findById(philosophySlugOrId)) as any;
    }

    if (!philosophy) {
      throw ApiError.notFound(`'${philosophySlugOrId}' felsefi akımı bulunamadı`);
    }

    // Retrieve 1 Book, 1 Movie, 1 Series concurrently
    const [book, movie, series] = await Promise.all([
      this.resolveItemForType(philosophy.id, ItemType.BOOK, level),
      this.resolveItemForType(philosophy.id, ItemType.MOVIE, level),
      this.resolveItemForType(philosophy.id, ItemType.SERIES, level),
    ]);

    const hasCompletePack = Boolean(book && movie && series);

    return {
      philosophy: {
        id: philosophy.id,
        name: philosophy.name,
        slug: philosophy.slug,
        era: philosophy.era,
        coreTenets: philosophy.coreTenets,
        description: philosophy.description,
      },
      requestedLevel: level,
      pack: {
        book,
        movie,
        series,
      },
      hasCompletePack,
      notes: hasCompletePack
        ? `${philosophy.name} akımı için '${level}' seviyesine uygun 1 Kitap, 1 Film ve 1 Dizi başarıyla birleştirildi.`
        : `Bazı medya türleri için tam eşleşme bulunamadı, mevcut en yakın içerikler paketlendi.`,
    };
  }

  async getDailyPack(): Promise<DailyPackResult> {
    const philosophies = await this.philosophyRepository.findAll();
    if (philosophies.length === 0) {
      throw ApiError.notFound('Sistemde henüz kayıtlı felsefi akım bulunmamaktadır');
    }

    // Deterministic daily index based on current date (UTC YYYY-MM-DD)
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    const selectedPhilosophy = philosophies[dayOfYear % philosophies.length];

    // Pick a daily tenet
    const tenets = selectedPhilosophy.coreTenets;
    const dailyTenet = tenets.length > 0 ? tenets[dayOfYear % tenets.length] : selectedPhilosophy.name;

    // Retrieve curated items
    const [book, movie, series] = await Promise.all([
      this.resolveItemForType(selectedPhilosophy.id, ItemType.BOOK, DifficultyLevel.BEGINNER),
      this.resolveItemForType(selectedPhilosophy.id, ItemType.MOVIE, DifficultyLevel.BEGINNER),
      this.resolveItemForType(selectedPhilosophy.id, ItemType.SERIES, DifficultyLevel.BEGINNER),
    ]);

    return {
      date: dateKey,
      theme: `Günün Felsefi İlhamı: ${selectedPhilosophy.name}`,
      dailyTenet,
      philosophy: {
        id: selectedPhilosophy.id,
        name: selectedPhilosophy.name,
        slug: selectedPhilosophy.slug,
        era: selectedPhilosophy.era,
        description: selectedPhilosophy.description,
      },
      pack: {
        book,
        movie,
        series,
      },
    };
  }

  async getFilteredRecommendations(query: FilterRecommendationsQuery) {
    let philosophyId: string | undefined;

    if (query.philosophySlug) {
      const philosophy = await this.philosophyRepository.findBySlug(query.philosophySlug);
      if (!philosophy) {
        throw ApiError.notFound(`'${query.philosophySlug}' felsefesi bulunamadı`);
      }
      philosophyId = philosophy.id;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.recommendationRepository.findFiltered({
      philosophyId,
      type: query.type,
      difficultyLevel: query.difficultyLevel,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecommendationById(id: string) {
    const item = await this.recommendationRepository.findById(id);
    if (!item) {
      throw ApiError.notFound('Öneri öğesi bulunamadı');
    }
    return item;
  }

  async createRecommendationItem(data: CreateRecommendationItemInput) {
    const philosophy = await this.philosophyRepository.findById(data.philosophyId);
    if (!philosophy) {
      throw ApiError.notFound('Belirtilen felsefe bulunamadı');
    }

    return this.recommendationRepository.create(data);
  }

  async updateRecommendationItem(id: string, data: UpdateRecommendationItemInput) {
    const existing = await this.recommendationRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Güncellenecek öneri öğesi bulunamadı');
    }

    if (data.philosophyId) {
      const philosophy = await this.philosophyRepository.findById(data.philosophyId);
      if (!philosophy) {
        throw ApiError.notFound('Belirtilen felsefe bulunamadı');
      }
    }

    return this.recommendationRepository.update(id, data);
  }

  async deleteRecommendationItem(id: string) {
    const existing = await this.recommendationRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Silinecek öneri öğesi bulunamadı');
    }

    return this.recommendationRepository.delete(id);
  }
}
