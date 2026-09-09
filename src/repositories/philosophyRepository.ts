import { Philosophy, DifficultyLevel } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreatePhilosophyInput, UpdatePhilosophyInput } from '../schemas/philosophySchemas';

export class PhilosophyRepository {
  async findAll(): Promise<(Philosophy & { _count: { recommendations: number } })[]> {
    return prisma.philosophy.findMany({
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Philosophy | null> {
    return prisma.philosophy.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string, difficultyLevel?: DifficultyLevel) {
    return prisma.philosophy.findUnique({
      where: { slug },
      include: {
        recommendations: {
          where: difficultyLevel ? { difficultyLevel } : undefined,
          orderBy: [{ difficultyLevel: 'asc' }, { releaseYear: 'asc' }],
        },
      },
    });
  }

  async create(data: CreatePhilosophyInput): Promise<Philosophy> {
    return prisma.philosophy.create({
      data,
    });
  }

  async update(id: string, data: UpdatePhilosophyInput): Promise<Philosophy> {
    return prisma.philosophy.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Philosophy> {
    return prisma.philosophy.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.philosophy.count();
  }
}
