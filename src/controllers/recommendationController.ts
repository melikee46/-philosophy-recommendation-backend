import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { DifficultyLevel } from '@prisma/client';

export class RecommendationController {
  constructor(private recommendationService: RecommendationService = new RecommendationService()) {}

  getPack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const philosophy = req.query.philosophy as string;
      const level = (req.query.level as DifficultyLevel) || DifficultyLevel.BEGINNER;

      const pack = await this.recommendationService.getDynamicPack(philosophy, level);
      ApiResponse.ok(res, pack, 'Dinamik felsefi öneri paketi başarıyla hazırlandı');
    } catch (error) {
      next(error);
    }
  };

  getDaily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dailyPack = await this.recommendationService.getDailyPack();
      ApiResponse.ok(res, dailyPack, 'Günün felsefi öneri paketi başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.recommendationService.getFilteredRecommendations(req.query as any);
      ApiResponse.ok(
        res,
        result.items,
        'Öneriler başarıyla listelendi',
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const item = await this.recommendationService.getRecommendationById(id);
      ApiResponse.ok(res, item, 'Öneri detayı başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.recommendationService.createRecommendationItem(req.body);
      ApiResponse.send(res, HttpStatus.CREATED, created, 'Öneri öğesi başarıyla eklendi');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const updated = await this.recommendationService.updateRecommendationItem(id, req.body);
      ApiResponse.ok(res, updated, 'Öneri öğesi başarıyla güncellendi');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.recommendationService.deleteRecommendationItem(id);
      ApiResponse.ok(res, null, 'Öneri öğesi başarıyla silindi');
    } catch (error) {
      next(error);
    }
  };
}
