import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quizService';
import { ApiResponse } from '../utils/apiResponse';

export class QuizController {
  constructor(private quizService: QuizService = new QuizService()) {}

  getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const questions = await this.quizService.getQuestions();
      ApiResponse.ok(res, questions, 'Felsefe anket soruları başarıyla getirildi');
    } catch (error) {
      next(error);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.quizService.calculateQuizResults(req.body);
      ApiResponse.ok(res, result, 'Felsefi eğiliminiz başarıyla hesaplandı ve öneri paketi hazırlandı');
    } catch (error) {
      next(error);
    }
  };
}
