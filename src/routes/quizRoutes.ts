import { Router } from 'express';
import { QuizController } from '../controllers/quizController';
import { validateRequest } from '../middlewares/validateRequest';
import { submitQuizSchema } from '../schemas/quizSchemas';

const router = Router();
const quizController = new QuizController();

router.get('/questions', quizController.getQuestions);
router.post('/submit', validateRequest({ body: submitQuizSchema }), quizController.submit);

export default router;
