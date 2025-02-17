import { Router, Request, Response } from 'express';
import db from '../db.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { fieldMapping, translateFields } from '../utils/vocabulary.js';

const router = Router();

router.get(
  '/user/results/:analysisId',
  authMiddleware,
  async (req: Request, res: Response) => {
    const { analysisId } = req.params;
    const userId = req.user?.student_id || req.user?.trainer_id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
      // Определяем таблицу, откуда брать данные
      const tableQuery = `SELECT analysis_table FROM analyzes WHERE analyze_id = $1`;
      const tableResult = await db.query(tableQuery, [analysisId]);

      if (tableResult.rows.length === 0) {
        return res.status(404).json({ message: 'Анализ не найден' });
      }

      const targetTable = tableResult.rows[0].analysis_table;

      // Получаем все колонки таблицы
      const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1
    `;
      const columnsResult = await db.query(columnsQuery, [targetTable]);

      const allColumns: string[] = columnsResult.rows.map(
        (row) => row.column_name
      );
      const excludedColumns = [
        'created_at',
        'result_id',
        'assignment_id',
        'student_id',
        'analyze_id',
      ];
      const selectedColumns = allColumns
        .filter((col) => !excludedColumns.includes(col))
        .join(', ');

      if (!selectedColumns) {
        return res.status(400).json({ message: 'Нет данных для отображения.' });
      }

      // Запрос результатов анализа
      const resultsQuery = `
        SELECT ${selectedColumns}, analyze_date
        FROM ${targetTable}
        WHERE analyze_id = $1 AND student_id = $2
      `;
      const results = await db.query(resultsQuery, [analysisId, userId]);

      if (results.rows.length === 0) {
        return res.status(404).json({ message: 'Данные не найдены.' });
      }

      const labels = Object.fromEntries(
        Object.entries(fieldMapping).map(([ru, en]) => [en, ru])
      );

      const translatedResults = results.rows.map((row) => {
        const translatedRow: Record<string, any> = { ...row };
        return translatedRow;
      });

      return res.status(200).json({ results: translatedResults, labels });
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
      return res.status(500).json({ message: 'Ошибка сервера.' });
    }
  }
);

export default router;
