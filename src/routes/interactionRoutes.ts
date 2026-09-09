import { Router } from 'express';
import { InteractionController } from '../controllers/interactionController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authMiddleware';
import {
  upsertInteractionSchema,
  getMyLibraryQuerySchema,
} from '../schemas/interactionSchemas';

const router = Router();
const interactionController = new InteractionController();

// All interaction routes require an authenticated user
router.use(authenticate);

router.post(
  '/',
  validateRequest({ body: upsertInteractionSchema }),
  interactionController.upsert
);

router.get(
  '/my-library',
  validateRequest({ query: getMyLibraryQuerySchema }),
  interactionController.getMyLibrary
);

router.get('/stats', interactionController.getStats);

router.delete('/:itemId', interactionController.delete);

export default router;
