import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { ApiError } from './apiError';
import { ErrorCodes } from '../constants/errorCodes';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

export class JwtUtil {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Erişim tokenının süresi dolmuş', ErrorCodes.TOKEN_EXPIRED);
      }
      throw ApiError.unauthorized('Geçersiz erişim tokenı', ErrorCodes.TOKEN_INVALID);
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Yenileme tokenının süresi dolmuş', ErrorCodes.TOKEN_EXPIRED);
      }
      throw ApiError.unauthorized('Geçersiz yenileme tokenı', ErrorCodes.TOKEN_INVALID);
    }
  }
}
