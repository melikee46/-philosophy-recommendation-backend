import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { JwtUtil } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { ErrorCodes } from '../constants/errorCodes';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Yetkilendirme başlığı (Bearer token) bulunamadı', ErrorCodes.AUTHENTICATION_ERROR);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Token formatı geçersiz', ErrorCodes.TOKEN_INVALID);
  }

  try {
    const payload = JwtUtil.verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Bu kaynağa erişim yetkiniz yok. Gerekli roller: ${roles.join(', ')}`,
          ErrorCodes.AUTHORIZATION_ERROR
        )
      );
    }

    next();
  };
};
