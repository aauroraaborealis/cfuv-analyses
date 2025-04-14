import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import profileController from '../controllers/profileController';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);

export default router;
