import db from '../db';

// export class ResultService {
//   static async getUserResults(userId: string, analysisId: string) {
//     // Определяем таблицу для анализа
//     const tableQuery = `SELECT analysis_table FROM analyzes WHERE analyze_id = $1`;
//     const tableResult = await db.query(tableQuery, [analysisId]);

//     console.log(tableResult);

//     if (tableResult.rows.length === 0) throw new Error('Анализ не найден.');

//     const targetTable = tableResult.rows[0].analysis_table;

//     // Получаем колонки таблицы
//     const columnsQuery = `
//       SELECT column_name
//       FROM information_schema.columns
//       WHERE table_name = $1
//     `;
//     const columnsResult = await db.query(columnsQuery, [targetTable]);

//     const allColumns: string[] = columnsResult.rows.map((row) => row.column_name);
//     const excludedColumns = ['created_at', 'result_id', 'assignment_id', 'student_id', 'analyze_id'];
//     const selectedColumns = allColumns.filter((col) => !excludedColumns.includes(col)).join(', ');

//     if (!selectedColumns) throw new Error('Нет данных для отображения.');

//     // Запрос результатов анализа
//     const resultsQuery = `
//       SELECT ${selectedColumns}, analyze_date
//       FROM ${targetTable}
//       WHERE analyze_id = $1 AND student_id = $2
//     `;
//     const results = await db.query(resultsQuery, [analysisId, userId]);

//     return { results: results.rows };
//   }
// }


/*

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
    const resultsQuery = `
      SELECT
        ap.parameter_name,
        ar.value,
        ar.is_normal,
        ar.created_at AS submitted_at
      FROM analysis_results ar
      JOIN analysis_parameters ap
        ON ap.parameter_id = ar.parameter_id
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
          isNormal: row.is_normal,
          measurements: [] as { value: number | string; date: Date }[]
        };
      }
      acc[key].measurements.push({ value: row.value, date: row.submitted_at });
      return acc;
    }, {} as Record<string, {
      parameter: string;
      isNormal: boolean;
      measurements: { value: number | string; date: Date }[];
    }>);

    // Преобразуем в массив
    const results = Object.values(grouped);

    return { results };
  }
}

*/

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
