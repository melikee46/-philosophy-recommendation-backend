import { Request, Response, NextFunction } from 'express';
import { PhilosophyService } from '../services/philosophyService';
import { ApiResponse } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { DifficultyLevel } from '@prisma/client';

export class PhilosophyController {
  constructor(private philosophyService: PhilosophyService = new PhilosophyService()) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const philosophies = await this.philosophyService.getAllPhilosophies();
      ApiResponse.ok(res, philosophies, 'Felsefi akımlar başarıyla listelendi');
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params as { slug: string };
      const difficultyLevel = req.query.difficultyLevel as DifficultyLevel | undefined;
      const philosophy = await this.philosophyService.getPhilosophyBySlug(slug, difficultyLevel);
      ApiResponse.ok(res, philosophy, 'Felsefi akım detayları ve önerileri başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.philosophyService.createPhilosophy(req.body);
      ApiResponse.send(res, HttpStatus.CREATED, created, 'Felsefi akım başarıyla oluşturuldu');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const updated = await this.philosophyService.updatePhilosophy(id, req.body);
      ApiResponse.ok(res, updated, 'Felsefi akım başarıyla güncellendi');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.philosophyService.deletePhilosophy(id);
      ApiResponse.ok(res, null, 'Felsefi akım başarıyla silindi');
    } catch (error) {
      next(error);
    }
  };
}
