import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = Router();

// router.post('/register-students/init', userController.registerStudentInit);
// router.post('/register-students/verify', userController.registerStudentVerify);

// router.post('/register-trainers/init', userController.registerTrainerInit);
// router.post('/register-trainers/verify', userController.registerTrainerVerify);

// router.post('/login', userController.login);


router.post('/register/init', userController.registerInit);     // 👈 единый
router.post('/register/verify', userController.registerVerify); // 👈 единый
router.post('/login/init', userController.loginInit);
router.post('/login/verify', userController.loginVerify);
router.post('/refresh', userController.refresh);
router.post('/logout', userController.logout);

// router.post('/login', userController.login);

export default router;
