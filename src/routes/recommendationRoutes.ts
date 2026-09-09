import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import {
  recommendationPackQuerySchema,
  filterRecommendationsQuerySchema,
  createRecommendationItemSchema,
  updateRecommendationItemSchema,
} from '../schemas/recommendationSchemas';
import { Role } from '@prisma/client';

const router = Router();
const recommendationController = new RecommendationController();

// Dynamic Pack endpoint (e.g. /api/v1/recommendations/pack?philosophy=stoicism&level=BEGINNER)
router.get(
  '/pack',
  validateRequest({ query: recommendationPackQuerySchema }),
  recommendationController.getPack
);

// Daily Pack endpoint (Günün Paketi)
router.get('/daily', recommendationController.getDaily);

// Search & Catalog
router.get(
  '/',
  validateRequest({ query: filterRecommendationsQuerySchema }),
  recommendationController.getAll
);

router.get('/:id', recommendationController.getById);

// Admin-only management
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest({ body: createRecommendationItemSchema }),
  recommendationController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest({ body: updateRecommendationItemSchema }),
  recommendationController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  recommendationController.delete
);

export default router;
