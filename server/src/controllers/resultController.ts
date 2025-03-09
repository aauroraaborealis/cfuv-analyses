import { Request, Response } from 'express';
import { ResultService } from '../services/resultService.js';

class ResultController {
  async getUserResults(req: Request, res: Response) {
    try {
      const { analysisId } = req.params;
      const userId = req.user?.student_id || req.user?.trainer_id;

      if (!userId) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const data = await ResultService.getUserResults(userId, analysisId);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Ошибка загрузки результатов:', error);
      res.status(500).json({ message: error.message || 'Ошибка сервера.' });
    }
  }
}

export default new ResultController();
