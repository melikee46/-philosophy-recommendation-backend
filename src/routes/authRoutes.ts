import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authMiddleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/authSchemas';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest({ body: registerSchema }), authController.register);
router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), authController.refreshToken);
router.get('/me', authenticate, authController.getMe);

export default router;
