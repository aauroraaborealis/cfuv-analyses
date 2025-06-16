import { Router } from 'express';
import AthleteController from '../controllers/athleteController';

const router = Router();

router.get('/', AthleteController.getStudentsByTeam);
router.get('/sport', AthleteController.getStudentsBySport);

export default router;
