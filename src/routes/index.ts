import { Router } from 'express';
import authRoutes from './authRoutes';
import philosophyRoutes from './philosophyRoutes';
import recommendationRoutes from './recommendationRoutes';
import interactionRoutes from './interactionRoutes';
import quizRoutes from './quizRoutes';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  ApiResponse.ok(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'philosophy-recommendation-engine-backend',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/philosophies', philosophyRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/interactions', interactionRoutes);
router.use('/quiz', quizRoutes);

export default router;
