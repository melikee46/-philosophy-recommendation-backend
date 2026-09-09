import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';

export interface ApiResponsePayload<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: HttpStatusCode,
    data?: T,
    message?: string,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: statusCode >= 200 && statusCode < 300,
      ...(message && { message }),
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(payload);
  }

  static ok<T>(res: Response, data: T, message?: string, meta?: Record<string, unknown>): Response {
    return this.send(res, HttpStatus.OK, data, message, meta);
  }

  static created<T>(res: Response, data: T, message = 'Kaynak başarıyla oluşturuldu'): Response {
    return this.send(res, HttpStatus.CREATED, data, message);
  }

  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
