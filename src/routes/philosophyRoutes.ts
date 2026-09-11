import { Router } from 'express';
import { PhilosophyController } from '../controllers/philosophyController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import {
  createPhilosophySchema,
  updatePhilosophySchema,
  getPhilosophyQuerySchema,
  philosophyIdParamSchema,
  philosophySlugParamSchema,
} from '../schemas/philosophySchemas';
import { Role } from '@prisma/client';

const router = Router();
const philosophyController = new PhilosophyController();

// Public routes
router.get('/', philosophyController.getAll);
router.get(
  '/:slug',
  validateRequest({ params: philosophySlugParamSchema }),
  validateRequest({ query: getPhilosophyQuerySchema }),
  philosophyController.getBySlug
);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest({ body: createPhilosophySchema }),
  philosophyController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest({ params: philosophyIdParamSchema }),
  validateRequest({ body: updatePhilosophySchema }),
  philosophyController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest({ params: philosophyIdParamSchema }),
  philosophyController.delete
);

export default router;
