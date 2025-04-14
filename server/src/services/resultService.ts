import db from '../db.js';
import { fieldMapping } from '../utils/vocabulary.js';

export class ResultService {
  static async getUserResults(userId: string, analysisId: string) {
    // Определяем таблицу для анализа
    const tableQuery = `SELECT analysis_table FROM analyzes WHERE analyze_id = $1`;
    const tableResult = await db.query(tableQuery, [analysisId]);

    if (tableResult.rows.length === 0) throw new Error('Анализ не найден.');

    const targetTable = tableResult.rows[0].analysis_table;

    // Получаем колонки таблицы
    const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1
    `;
    const columnsResult = await db.query(columnsQuery, [targetTable]);

    const allColumns: string[] = columnsResult.rows.map((row) => row.column_name);
    const excludedColumns = ['created_at', 'result_id', 'assignment_id', 'student_id', 'analyze_id'];
    const selectedColumns = allColumns.filter((col) => !excludedColumns.includes(col)).join(', ');

    if (!selectedColumns) throw new Error('Нет данных для отображения.');

    // Запрос результатов анализа
    const resultsQuery = `
      SELECT ${selectedColumns}, analyze_date
      FROM ${targetTable}
      WHERE analyze_id = $1 AND student_id = $2
    `;
    const results = await db.query(resultsQuery, [analysisId, userId]);

    const labels = Object.fromEntries(Object.entries(fieldMapping).map(([ru, en]) => [en, ru]));

    return { results: results.rows, labels };
  }
}
