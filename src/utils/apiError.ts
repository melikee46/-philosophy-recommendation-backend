import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';
import { ErrorCode, ErrorCodes } from '../constants/errorCodes';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    errorCode: ErrorCode = ErrorCodes.BAD_REQUEST,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode: ErrorCode = ErrorCodes.BAD_REQUEST, details?: unknown) {
    return new ApiError(HttpStatus.BAD_REQUEST, message, errorCode, details);
  }

  static unauthorized(message = 'Kimlik doğrulama başarısız', errorCode: ErrorCode = ErrorCodes.AUTHENTICATION_ERROR) {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, errorCode);
  }

  static forbidden(message = 'Bu işlem için yetkiniz bulunmamaktadır', errorCode: ErrorCode = ErrorCodes.AUTHORIZATION_ERROR) {
    return new ApiError(HttpStatus.FORBIDDEN, message, errorCode);
  }

  static notFound(message = 'Kaynak bulunamadı', errorCode: ErrorCode = ErrorCodes.RESOURCE_NOT_FOUND) {
    return new ApiError(HttpStatus.NOT_FOUND, message, errorCode);
  }

  static conflict(message = 'Kayıt zaten mevcut', errorCode: ErrorCode = ErrorCodes.RESOURCE_ALREADY_EXISTS) {
    return new ApiError(HttpStatus.CONFLICT, message, errorCode);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, ErrorCodes.VALIDATION_ERROR, details);
  }

  static internal(message = 'Sunucu içi bir hata oluştu', errorCode: ErrorCode = ErrorCodes.INTERNAL_ERROR) {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, errorCode, undefined, false);
  }
}
