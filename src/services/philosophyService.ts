import { DifficultyLevel } from '@prisma/client';
import { PhilosophyRepository } from '../repositories/philosophyRepository';
import { ApiError } from '../utils/apiError';
import { CreatePhilosophyInput, UpdatePhilosophyInput } from '../schemas/philosophySchemas';

export class PhilosophyService {
  constructor(private philosophyRepository: PhilosophyRepository = new PhilosophyRepository()) {}

  async getAllPhilosophies() {
    const philosophies = await this.philosophyRepository.findAll();
    return philosophies.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      era: p.era,
      description: p.description,
      coreTenets: p.coreTenets,
      totalRecommendations: p._count.recommendations,
      createdAt: p.createdAt,
    }));
  }

  async getPhilosophyBySlug(slug: string, difficultyLevel?: DifficultyLevel) {
    const philosophy = await this.philosophyRepository.findBySlug(slug, difficultyLevel);
    if (!philosophy) {
      throw ApiError.notFound(`'${slug}' slug değerine sahip felsefi akım bulunamadı`);
    }

    return philosophy;
  }

  async createPhilosophy(data: CreatePhilosophyInput) {
    const existing = await this.philosophyRepository.findBySlug(data.slug);
    if (existing) {
      throw ApiError.conflict(`'${data.slug}' slug değerine sahip felsefe zaten mevcut`);
    }

    return this.philosophyRepository.create(data);
  }

  async updatePhilosophy(id: string, data: UpdatePhilosophyInput) {
    const existing = await this.philosophyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Güncellenecek felsefe bulunamadı');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await this.philosophyRepository.findBySlug(data.slug);
      if (slugConflict) {
        throw ApiError.conflict(`'${data.slug}' slug değeri başka bir felsefe tarafından kullanılıyor`);
      }
    }

    return this.philosophyRepository.update(id, data);
  }

  async deletePhilosophy(id: string) {
    const existing = await this.philosophyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Silinecek felsefe bulunamadı');
    }

    return this.philosophyRepository.delete(id);
  }
}
