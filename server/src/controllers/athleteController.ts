import { Request, Response } from 'express';
import { AthleteService } from '../services/athleteService';

class AthleteController {
  async getStudentsByTeam(req: Request, res: Response) {
    try {
      const { team_id } = req.query;
      const students = await AthleteService.getStudentsByTeam(team_id as string);
      res.status(200).json(students);
    } catch (error: any) {
      console.error('Ошибка получения спортсменов:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }

  async getStudentsBySport(req: Request, res: Response) {
    try {
      const { sport_id } = req.query;
      if (!sport_id) return res.status(400).json({ message: 'Sport ID is required.' });

      const students = await AthleteService.getStudentsBySport(sport_id as string);
      res.status(200).json(students);
    } /* istanbul ignore next */ 
    catch (error: any) {
      /* istanbul ignore next */ 
      console.error('Ошибка получения спортсменов по виду спорта:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  }
}

export default new AthleteController();
