import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ApiResponse.send(
        res,
        HttpStatus.CREATED,
        result,
        'Kullanıcı kaydı başarıyla oluşturuldu'
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      ApiResponse.ok(res, result, 'Giriş başarılı');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      ApiResponse.ok(res, tokens, 'Token başarıyla yenilendi');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user!.id;
      const profile = await this.authService.getMe(currentUserId);
      ApiResponse.ok(res, profile, 'Kullanıcı bilgileri başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };
}
