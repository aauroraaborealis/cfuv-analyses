import db from '../db';

export class ResultService {
  static async getUserResults(userId: string, analysisId: string) {
    const analyzeCheck = await db.query(
      `SELECT analyze_name
       FROM analyzes
       WHERE analyze_id = $1`,
      [analysisId]
    );
    if (analyzeCheck.rows.length === 0) {
      throw new Error('Анализ не найден.');
    }

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

    const grouped = rows.reduce(
      (acc, row) => {
        const key = row.parameter_name;
        if (!acc[key]) {
          acc[key] = {
            parameter: key,
            lowerBound: row.lower_bound,
            upperBound: row.upper_bound,
            measurements: [] as { value: number | string; date: Date }[],
          };
        }
        acc[key].measurements.push({
          value: row.value,
          date: row.submitted_at,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          parameter: string;
          lowerBound: number | null;
          upperBound: number | null;
          measurements: { value: number | string; date: Date }[];
        }
      >
    );

    const results = Object.values(grouped);

    return { results };
  }
}
