import { Router } from 'express';
import resultController from '../controllers/resultController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/user/results/:analysisId', authMiddleware, resultController.getUserResults);

export default router;
