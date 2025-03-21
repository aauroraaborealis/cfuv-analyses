import db from '../db.js';
import { notifyUser } from '../socketServer.js';
import { getTargetTable, fieldMapping, translateFields } from '../utils/vocabulary.js';

export class AnalyzeService {
  static async getUserAnalyses(student_id: string) {
    const userAnalysesQuery = `
      SELECT
        aa.assignment_id,
        a.analyze_name,
        a.analysis_table,
        aa.scheduled_date,
        aa.assigned_to_team
      FROM analyze_assignments aa
      JOIN analyzes a ON aa.analyze_id = a.analyze_id
      WHERE aa.student_id = $1
      AND aa.assigned_to_team = false
    `;
    const userAnalyses = await db.query(userAnalysesQuery, [student_id]);

    const teamAnalysesQuery = `
      SELECT
        aa.assignment_id,
        a.analyze_name,
        a.analysis_table,
        aa.scheduled_date,
        aa.assigned_to_team
      FROM analyze_assignments aa
      JOIN analyzes a ON aa.analyze_id = a.analyze_id
      JOIN students s ON aa.team_id = s.team_id
      WHERE s.student_id = $1
      AND aa.assigned_to_team = true
    `;
    const teamAnalyses = await db.query(teamAnalysesQuery, [student_id]);

    const allAnalyses = [...userAnalyses.rows, ...teamAnalyses.rows];

    return await Promise.all(
      allAnalyses.map(async (analysis) => {
        const { assignment_id, analysis_table } = analysis;

        if (!analysis_table) {
          return { ...analysis, is_submitted: false };
        }

        const resultCheckQuery = `
          SELECT 1 FROM ${analysis_table} WHERE assignment_id = $1 AND student_id = $2
        `;
        const resultCheck = await db.query(resultCheckQuery, [assignment_id, student_id]);

        return {
          ...analysis,
          is_submitted: resultCheck?.rowCount ?? false,
        };
      })
    );
  }

  static async submitAnalysis(student_id: string, assignment_id: string, analyze_data: Record<string, any>) {
    const assignmentCheck = await db.query(
      'SELECT * FROM analyze_assignments WHERE assignment_id = $1',
      [assignment_id]
    );

    if (assignmentCheck.rowCount === 0) {
      throw new Error('Assignment not found.');
    }

    const analyzeId = assignmentCheck.rows[0].analyze_id;

    const analyzeTypeQuery = await db.query(
      'SELECT analyze_name FROM analyzes WHERE analyze_id = $1',
      [analyzeId]
    );

    if (analyzeTypeQuery.rowCount === 0) {
      throw new Error('Analyze type not found.');
    }

    const analyzeName = analyzeTypeQuery.rows[0].analyze_name;
    const targetTable = getTargetTable(analyzeName);

    if (!targetTable) {
      throw new Error('Unsupported analyze type.');
    }

    const mappedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(analyze_data)) {
      if (fieldMapping[key]) {
        mappedData[fieldMapping[key]] = value;
      }
    }

    if (Object.keys(mappedData).length === 0) {
      throw new Error('No valid analyze data provided.');
    }

    const result = await db.query(
      `INSERT INTO ${targetTable} (assignment_id, student_id, analyze_id, ${Object.keys(mappedData).join(', ')}, analyze_date, created_at)
       VALUES ($1, $2, $3, ${Object.values(mappedData).map((_, i) => `$${i + 4}`).join(', ')}, CURRENT_DATE, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assignment_id, student_id, analyzeId, ...Object.values(mappedData)]
    );

    return result.rows[0];
  }

  static async getDetailedResults(assignment_id: string, analyze_name: string) {
    const targetTable = getTargetTable(analyze_name);
    if (!targetTable) {
      throw new Error('Unsupported analyze type.');
    }

    const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
    `;
    const columnsResult = await db.query(columnsQuery, [targetTable]);
    const allColumns: string[] = columnsResult.rows.map((row) => row.column_name);

    const excludedColumns = ['created_at', 'result_id', 'assignment_id', 'student_id', 'analyze_id', 'analyze_date'];
    const selectedColumns = allColumns.filter((col) => !excludedColumns.includes(col)).join(', ');

    if (!selectedColumns) {
      throw new Error('No valid columns to select.');
    }

    const resultsQuery = `SELECT ${selectedColumns} FROM ${targetTable} WHERE assignment_id = $1`;
    const results = await db.query(resultsQuery, [assignment_id]);

    if (results.rows.length === 0) {
      throw new Error('No data found for this assignment ID.');
    }

    const reversedFieldMapping: Record<string, string> = Object.fromEntries(
      Object.entries(fieldMapping).map(([key, value]) => [value, key])
    );

    return translateFields(results.rows, reversedFieldMapping);
  }

  static async getAllAnalyses() {
    const result = await db.query('SELECT * FROM analyzes');
    return result.rows;
  }

  static async assignAnalysis(analyze_id: string, sport_id: string, team_id: string | null, student_id: string | null, due_date: string, created_by: string) {
    // Проверка существования записей
    const analyzeCheck = await db.query('SELECT analyze_id FROM analyzes WHERE analyze_id = $1', [analyze_id]);
    if (analyzeCheck.rowCount === 0) throw new Error('Analyze type not found.');

    const sportCheck = await db.query('SELECT sport_id FROM sports WHERE sport_id = $1', [sport_id]);
    if (sportCheck.rowCount === 0) throw new Error('Sport not found.');

    if (team_id) {
      const teamCheck = await db.query('SELECT team_id FROM teams WHERE team_id = $1', [team_id]);
      if (teamCheck.rowCount === 0) throw new Error('Team not found.');
    }

    if (student_id) {
      const studentCheck = await db.query('SELECT student_id FROM students WHERE student_id = $1', [student_id]);
      if (studentCheck.rowCount === 0) throw new Error('Student not found.');
    }

    // Запрос на создание анализа
    const query = `
      INSERT INTO analyze_assignments (
        analyze_id, team_id, student_id, scheduled_date, assigned_to_team, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING assignment_id;
    `;
    const values = [analyze_id, team_id || null, student_id || null, due_date, !!team_id, created_by];
    const result = await db.query(query, values);
    const assignment_id = result.rows[0].assignment_id;

    // Отправка уведомлений студентам или команде
    const analyzeNameQuery = await db.query('SELECT analyze_name FROM analyzes WHERE analyze_id = $1', [analyze_id]);
    const analyzeName = analyzeNameQuery.rows[0]?.analyze_name || 'Неизвестный анализ';

    if (student_id) {
      notifyUser(student_id, {
        type: 'NEW_ANALYSIS',
        data: { assignment_id, analyze_id, analyze_name: analyzeName, scheduled_date: due_date, assigned_to_team: !!team_id },
      });
    }

    if (team_id) {
      const teamMembersQuery = await db.query('SELECT student_id FROM students WHERE team_id = $1', [team_id]);
      for (const member of teamMembersQuery.rows) {
        notifyUser(member.student_id, {
          type: 'NEW_ANALYSIS',
          data: { assignment_id, analyze_id, analyze_name: analyzeName, scheduled_date: due_date, assigned_to_team: true },
        });
      }
    }

    return assignment_id;
  }

  static async getTableData(tableName: string) {
    const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1
      AND column_name NOT IN ('result_id', 'assignment_id', 'student_id', 'analyze_id', 'created_at')
    `;
    const columnsResult = await db.query(columnsQuery, [tableName]);

    const columns = columnsResult.rows.map((row) =>
      row.column_name === "analyze_date" ? `TO_CHAR(${row.column_name}, 'DD.MM.YYYY') AS analyze_date` : row.column_name
    ).join(', ');

    if (!columns) throw new Error("No valid columns to select.");

    const query = `
      SELECT 
          s.first_name,
          s.last_name,
          s.middle_name,
          sp.sport_name,
          t.team_name,
          ${columns}
      FROM ${tableName} r
      LEFT JOIN students s ON r.student_id = s.student_id
      LEFT JOIN teams t ON s.team_id = t.team_id
      LEFT JOIN sports sp ON s.sport_id = sp.sport_id;
    `;

    const results = await db.query(query);

    const reversedFieldMapping: Record<string, string> = Object.fromEntries(
      Object.entries(fieldMapping).map(([key, value]) => [value, key])
    );

    return translateFields(results.rows, reversedFieldMapping);
  }

}
