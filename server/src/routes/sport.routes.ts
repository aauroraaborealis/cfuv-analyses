import { Router } from 'express';
import sportController from '../controllers/sportController.js';

const router = Router();

router.post('/create', sportController.createSport);
router.get('/list', sportController.getAllSports);

export default router;
