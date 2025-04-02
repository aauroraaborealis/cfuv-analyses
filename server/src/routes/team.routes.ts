

import { Router } from 'express';
import teamController from '../controllers/teamController.js';

const router = Router();

router.post('/create', teamController.createTeam);
router.get('/list', teamController.getTeamsBySport);

export default router;

