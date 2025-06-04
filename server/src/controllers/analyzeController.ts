import { Request, Response } from 'express';
import { AnalyzeService } from '../services/analyzeService';
import jwt from 'jsonwebtoken';

class AnalyzeController {
  async getUserAnalyses(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      /* istanbul ignore next */ 
      if (!token) {
        /* istanbul ignore next */ 
        return res
          .status(401)
          .json({ message: 'Authorization token is required.' });
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_SECRET as string
      ) as { id: string };
      const student_id = decoded.id;

      const analyses = await AnalyzeService.getUserAnalyses(student_id);
      res.status(200).json({ analyses });
    }  /* istanbul ignore next */ 
    catch (error: any) {
      /* istanbul ignore next */ 
      console.error('Ошибка получения анализов пользователя:', error);
      /* istanbul ignore next */ 
      res
        .status(500)
        .json({ message: error.message || 'Internal server error.' });
    }
  }

  async submitAnalysis(req: Request, res: Response) {
    try {
      const { assignment_id, analyze_data } = req.body;
      /* istanbul ignore next */
      if (!assignment_id || !analyze_data) {
        /* istanbul ignore next */
        return res
          .status(400)
          .json({ message: 'Assignment ID and analyze data are required.' });
      }

      const token = req.headers.authorization?.split(' ')[1];
      /* istanbul ignore next */
      if (!token) {
        /* istanbul ignore next */
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_SECRET as string
      ) as { id: string };
      const student_id = decodedToken.id;

      const result = await AnalyzeService.submitAnalysis(
        student_id,
        assignment_id,
        analyze_data
      );
      res
        .status(201)
        .json({ message: 'Analysis submitted successfully.', result });
    } catch (error: any) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      console.error('Ошибка отправки анализа:', error);
      /* istanbul ignore next */
      res
        .status(500)
        .json({ message: error.message || 'Internal server error.' });
    }
  }

  async getAllAnalyses(req: Request, res: Response) {
    try {
      const analyses = await AnalyzeService.getAllAnalyses();
      res.status(200).json(analyses);
    } catch (error: any) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      console.error('Ошибка получения анализов:', error);
      /* istanbul ignore next */
      res.status(500).json({ message: 'Ошибка сервера.' });
    }
  }

  async getDetailedResults(req: Request, res: Response) {
    try {
      const { assignment_id, analyze_id } = req.body;
      /* istanbul ignore next */
      if (!assignment_id || !analyze_id) {
        /* istanbul ignore next */
        return res
          .status(400)
          .json({ message: 'assignment_id и analyze_id обязательны' });
      }

      const results = await AnalyzeService.getDetailedResults(
        assignment_id,
        analyze_id
      );
      res.status(200).json({ results });
      /* istanbul ignore next */
    } catch (error: any) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      console.error('Ошибка получения детальных результатов анализа:', error);
      /* istanbul ignore next */
      res
        .status(500)
        .json({ message: error.message || 'Internal server error.' });
    }
  }

  async getTableData(req: Request, res: Response) {
    try {
      const { tableName } = req.params;

      const data = await AnalyzeService.getTableData(tableName);
      res.json(data);
      /* istanbul ignore next */
    } catch (error: any) {
      /* istanbul ignore next */
      console.error('Ошибка при запросе к таблице:', error);
      /* istanbul ignore next */
      res.status(500).json({
        message:
          error.message || 'Ошибка сервера при получении данных из таблицы.',
      });
    }
  }

  async assignAnalysis(req: Request, res: Response) {
    try {
      const { analyze_id, sport_id, team_id, student_id, due_date } = req.body;
      const created_by = req.user?.trainer_id;
      /* istanbul ignore next */
      if (!analyze_id || !sport_id || !due_date || (!team_id && !student_id)) {
        /* istanbul ignore next */
        return res.status(400).json({ message: 'Не все поля заполнены' });
      }
      /* istanbul ignore next */
      if (!created_by) {
        /* istanbul ignore next */
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const assignment_id = await AnalyzeService.assignAnalysis(
        analyze_id,
        sport_id,
        team_id,
        student_id,
        due_date,
        created_by
      );
      res
        .status(201)
        .json({ message: 'Analysis assigned successfully.', assignment_id });
    } catch (error: any) {
      /* istanbul ignore next */
      /* istanbul ignore next */
      console.error('Ошибка назначения анализа:', error);
      /* istanbul ignore next */
      res
        .status(500)
        .json({ message: error.message || 'Internal server error.' });
    }
  }
}

export default new AnalyzeController();
