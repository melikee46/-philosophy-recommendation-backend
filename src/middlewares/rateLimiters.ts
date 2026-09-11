import rateLimit from 'express-rate-limit';
import { HttpStatus } from '../constants/httpStatus';

const rateLimitMessage = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.';

const createAuthLimiter = (windowMs: number, limit: number, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: {
      success: false,
      errorCode: 'RATE_LIMITED',
      message: rateLimitMessage,
    },
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
  });

export const registerRateLimiter = createAuthLimiter(60 * 60 * 1000, 5);
export const loginRateLimiter = createAuthLimiter(15 * 60 * 1000, 10, true);
export const refreshRateLimiter = createAuthLimiter(15 * 60 * 1000, 30);
