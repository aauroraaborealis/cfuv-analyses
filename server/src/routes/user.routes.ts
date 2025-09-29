import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

router.post('/register', userController.register);    
router.post('/login', userController.login);
router.post('/refresh', userController.refresh);
router.post('/logout', userController.logout);

export default router;
