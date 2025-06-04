import db from '../db';

export class ResultService {
  static async getUserResults(userId: string, analysisId: string) {
    // Проверяем, что анализ существует
    const analyzeCheck = await db.query(
      `SELECT analyze_name
       FROM analyzes
       WHERE analyze_id = $1`,
      [analysisId]
    );
    if (analyzeCheck.rows.length === 0) {
      throw new Error('Анализ не найден.');
    }

    // Получаем все результаты данного анализа для студента
    // и значения границ нормы из reference_values
    const resultsQuery = `
      SELECT
        ap.parameter_name,
        ar.value,
        ar.created_at AS submitted_at,
        rv.lower_bound,
        rv.upper_bound
      FROM analysis_results ar
      JOIN analysis_parameters ap
        ON ap.parameter_id = ar.parameter_id
      LEFT JOIN reference_values rv
        ON rv.analyze_id = ar.analyze_id
       AND rv.parameter_id = ar.parameter_id
      WHERE ar.analyze_id = $1
        AND ar.student_id = $2
      ORDER BY ap.parameter_name, ar.created_at ASC
    `;

    const { rows } = await db.query(resultsQuery, [analysisId, userId]);

    if (rows.length === 0) {
      return { results: [] };
    }

    // Группируем результаты по параметру
    const grouped = rows.reduce((acc, row) => {
      const key = row.parameter_name;
      if (!acc[key]) {
        acc[key] = {
          parameter: key,
          lowerBound: row.lower_bound,
          upperBound: row.upper_bound,
          measurements: [] as { value: number | string; date: Date }[]
        };
      }
      acc[key].measurements.push({ value: row.value, date: row.submitted_at });
      return acc;
    }, {} as Record<string, {
      parameter: string;
      lowerBound: number | null;
      upperBound: number | null;
      measurements: { value: number | string; date: Date }[];
    }>);

    // Преобразуем в массив
    const results = Object.values(grouped);

    return { results };
  }
}
