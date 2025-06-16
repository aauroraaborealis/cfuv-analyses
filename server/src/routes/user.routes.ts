import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

router.post('/register/init', userController.registerInit);    
router.post('/register/verify', userController.registerVerify); 
router.post('/login/init', userController.loginInit);
router.post('/login/verify', userController.loginVerify);
router.post('/refresh', userController.refresh);
router.post('/logout', userController.logout);
router.post('/resend', userController.resendCode);

export default router;
