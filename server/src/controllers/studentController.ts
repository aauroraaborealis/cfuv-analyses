import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';

class StudentController {
  async getStudentsByTeam(req: Request, res: Response) {
    try {
      const { team_id } = req.query;
      const students = await StudentService.getStudentsByTeam(team_id as string);
      res.status(200).json({ message: 'Students retrieved successfully.', students });
    } catch (error: any) {
      console.error('Ошибка получения студентов:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }

  async getStudentsBySport(req: Request, res: Response) {
    try {
      const { sport_id } = req.query;
      if (!sport_id) return res.status(400).json({ message: 'Sport ID is required.' });

      const students = await StudentService.getStudentsBySport(sport_id as string);
      res.status(200).json(students);
    } catch (error: any) {
      console.error('Ошибка получения студентов по виду спорта:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  }
}

export default new StudentController();
