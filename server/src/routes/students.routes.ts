import { Router } from 'express';
import studentController from '../controllers/studentController.js';

const router = Router();

router.get('/', studentController.getStudentsByTeam);
router.get('/sport', studentController.getStudentsBySport);

export default router;
