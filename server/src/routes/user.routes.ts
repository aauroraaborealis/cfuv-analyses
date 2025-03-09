import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = Router();

router.post('/register-students', userController.registerStudent);
router.post('/register-trainers', userController.registerTrainer);
router.post('/login', userController.login);

export default router;
