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
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export class JwtUtil {
  static generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: 'philosophy-recommendation-api',
      audience: 'philosophy-recommendation-client',
    });
  }

  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
    return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      issuer: 'philosophy-recommendation-api',
      audience: 'philosophy-recommendation-client',
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
        issuer: 'philosophy-recommendation-api',
        audience: 'philosophy-recommendation-client',
      }) as TokenPayload;
      if (payload.type !== 'access') throw new jwt.JsonWebTokenError('Invalid token type');
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Erişim tokenının süresi dolmuş', ErrorCodes.TOKEN_EXPIRED);
      }
      throw ApiError.unauthorized('Geçersiz erişim tokenı', ErrorCodes.TOKEN_INVALID);
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: 'philosophy-recommendation-api',
        audience: 'philosophy-recommendation-client',
      }) as RefreshTokenPayload;
      if (payload.type !== 'refresh') throw new jwt.JsonWebTokenError('Invalid token type');
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Yenileme tokenının süresi dolmuş', ErrorCodes.TOKEN_EXPIRED);
      }
      throw ApiError.unauthorized('Geçersiz yenileme tokenı', ErrorCodes.TOKEN_INVALID);
    }
  }
}
