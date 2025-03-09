import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import profileController from '../controllers/profileController.js';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);

export default router;
