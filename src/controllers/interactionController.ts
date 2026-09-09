import { Request, Response, NextFunction } from 'express';
import { InteractionService } from '../services/interactionService';
import { ApiResponse } from '../utils/apiResponse';

export class InteractionController {
  constructor(private interactionService: InteractionService = new InteractionService()) {}

  upsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const interaction = await this.interactionService.upsertInteraction(userId, req.body);
      ApiResponse.ok(res, interaction, 'Etkileşim başarıyla kaydedildi/güncellendi');
    } catch (error) {
      next(error);
    }
  };

  getMyLibrary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.interactionService.getUserLibrary(userId, req.query as any);
      ApiResponse.ok(
        res,
        result.interactions,
        'Kişisel felsefe kütüphaneniz başarıyla getirildi',
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      await this.interactionService.removeInteraction(userId, itemId);
      ApiResponse.ok(res, null, 'Öğe kütüphanenizden kaldırıldı');
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const stats = await this.interactionService.getUserStats(userId);
      ApiResponse.ok(res, stats, 'Kullanıcı kütüphane istatistikleri başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };
}
