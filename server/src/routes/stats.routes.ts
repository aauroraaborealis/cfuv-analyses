import { Router } from 'express';
import resultController from '../controllers/resultController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/user/results/:analysisId', authMiddleware, resultController.getUserResults);

export default router;
