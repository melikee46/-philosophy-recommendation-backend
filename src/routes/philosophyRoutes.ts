import { Router } from 'express';
import { PhilosophyController } from '../controllers/philosophyController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import {
  createPhilosophySchema,
  updatePhilosophySchema,
  getPhilosophyQuerySchema,
} from '../schemas/philosophySchemas';
import { Role } from '@prisma/client';

const router = Router();
const philosophyController = new PhilosophyController();

// Public routes
router.get('/', philosophyController.getAll);
router.get(
  '/:slug',
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
  validateRequest({ body: updatePhilosophySchema }),
  philosophyController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  philosophyController.delete
);

export default router;
