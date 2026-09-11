import { User, Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async replaceRefreshTokenHash(
    userId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string
  ): Promise<boolean> {
    const result = await prisma.user.updateMany({
      where: { id: userId, refreshTokenHash: currentRefreshTokenHash },
      data: { refreshTokenHash: nextRefreshTokenHash },
    });
    return result.count === 1;
  }
}
