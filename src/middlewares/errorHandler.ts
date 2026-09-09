import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // 1. Custom ApiError
  if (err instanceof ApiError) {
    const responsePayload: Record<string, unknown> = {
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    };
    if (err.details !== undefined) {
      responsePayload.details = err.details;
    }
    if (env.NODE_ENV === 'development') {
      responsePayload.stack = err.stack;
    }
    res.status(err.statusCode).json(responsePayload);
    return;
  }

  // 2. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'alan';
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        errorCode: ErrorCodes.RESOURCE_ALREADY_EXISTS,
        message: `Bu ${target} değeri ile kayıt zaten mevcut`,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        errorCode: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'İstenen kaynak veritabanında bulunamadı',
      });
      return;
    }
  }

  // 3. SyntaxError in JSON body parsing
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      errorCode: ErrorCodes.BAD_REQUEST,
      message: 'Gönderilen JSON gövdesi biçimlendirme hatası içeriyor',
    });
    return;
  }

  // 4. Unhandled / Internal Server Error
  console.error('💥 Unhandled Exception:', err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    errorCode: ErrorCodes.INTERNAL_ERROR,
    message: 'Sunucuda beklenmeyen bir hata oluştu',
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    errorCode: ErrorCodes.RESOURCE_NOT_FOUND,
    message: `İstenen endpoint bulunamadı: [${req.method}] ${req.originalUrl}`,
  });
};
