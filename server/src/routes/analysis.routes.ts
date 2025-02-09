import { Request, Response, Router } from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import { notifyUser } from '../socketServer.js';
import {
  fieldMapping,
  getTargetTable,
  translateFields,
  validTables,
} from '../utils/vocabulary.js';

const router = Router();

router.post('/assign', async (req: Request, res: Response) => {
  const { analyze_id, sport_id, team_id, student_id, due_date } = req.body;

  if (!analyze_id || !sport_id || !due_date || (!team_id && !student_id)) {
    return res.status(400).json({
      message: 'Не все поля заполнены',
    });
  }

  try {
    const analyzeCheck = await db.query(
      'SELECT analyze_id FROM analyzes WHERE analyze_id = $1',
      [analyze_id]
    );
    if (analyzeCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Analyze type not found.' });
    }

    const sportCheck = await db.query(
      'SELECT sport_id FROM sports WHERE sport_id = $1',
      [sport_id]
    );
    if (sportCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Sport not found.' });
    }

    if (team_id) {
      const teamCheck = await db.query(
        'SELECT team_id FROM teams WHERE team_id = $1',
        [team_id]
      );
      if (teamCheck.rowCount === 0) {
        return res.status(404).json({ message: 'Team not found.' });
      }
    }

    if (student_id) {
      const studentCheck = await db.query(
        'SELECT student_id FROM students WHERE student_id = $1',
        [student_id]
      );
      if (studentCheck.rowCount === 0) {
        return res.status(404).json({ message: 'Student not found.' });
      }
    }

    const query = `
      INSERT INTO analyze_assignments (
        analyze_id, team_id, student_id, scheduled_date, assigned_to_team
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING assignment_id;
    `;
    const values = [
      analyze_id,
      team_id || null,
      student_id || null,
      due_date,
      !!team_id,
    ];
    const result = await db.query(query, values);

    console.log(student_id);

    if (student_id) {
      const analyzeNameQuery = await db.query(
        'SELECT analyze_name FROM analyzes WHERE analyze_id = $1',
        [analyze_id]
      );

      const analyzeName =
        analyzeNameQuery.rows[0]?.analyze_name || 'Неизвестный анализ';
      let scheduled_date = due_date;

      notifyUser(student_id, {
        type: 'NEW_ANALYSIS',
        data: {
          assignment_id: result.rows[0].assignment_id,
          analyze_id,
          analyze_name: analyzeName,
          scheduled_date,
          assigned_to_team: !!team_id,
        },
      });
    }

    if (team_id) {
      const teamMembersQuery = await db.query(
        'SELECT student_id FROM students WHERE team_id = $1',
        [team_id]
      );

      const teamMembers = teamMembersQuery.rows;

      const analyzeNameQuery = await db.query(
        'SELECT analyze_name FROM analyzes WHERE analyze_id = $1',
        [analyze_id]
      );

      const analyzeName =
        analyzeNameQuery.rows[0]?.analyze_name || 'Неизвестный анализ';
      let scheduled_date = due_date;

      for (const member of teamMembers) {
        notifyUser(member.student_id, {
          type: 'NEW_ANALYSIS',
          data: {
            assignment_id: result.rows[0].assignment_id,
            analyze_id,
            analyze_name: analyzeName,
            scheduled_date,
            assigned_to_team: true,
          },
        });
      }
    }

    res.status(201).json({
      message: 'Analysis assigned successfully.',
      assignment_id: result.rows[0].assignment_id,
    });
  } catch (error) {
    console.error('Error assigning analysis:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM analyzes');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching analyses:', (error as Error).message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/user', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Authorization token is required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const student_id = decoded.id;

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

    const analysesWithStatus = await Promise.all(
      allAnalyses.map(async (analysis) => {
        const { assignment_id, analysis_table } = analysis;

        if (!analysis_table) {
          return { ...analysis, is_submitted: false };
        }

        const resultCheckQuery = `
          SELECT 1 FROM ${analysis_table} WHERE assignment_id = $1 AND student_id = $2
        `;
        const resultCheck = await db.query(resultCheckQuery, [
          assignment_id,
          student_id,
        ]);

        return {
          ...analysis,
          is_submitted: resultCheck.rowCount ?? 0 > 0,
        };
      })
    );

    res.status(200).json({ analyses: analysesWithStatus });
  } catch (error) {
    console.error('Ошибка получения анализов пользователя:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/submit', async (req: Request, res: Response) => {
  const { assignment_id, analyze_data } = req.body;

  if (!assignment_id || !analyze_data) {
    return res
      .status(400)
      .json({ message: 'Assignment ID and analyze data are required.' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: string;
    };

    const student_id = decodedToken.id;

    const assignmentCheck = await db.query(
      'SELECT * FROM analyze_assignments WHERE assignment_id = $1',
      [assignment_id]
    );

    if (assignmentCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const analyzeId = assignmentCheck.rows[0].analyze_id;

    const analyzeTypeQuery = await db.query(
      'SELECT analyze_name FROM analyzes WHERE analyze_id = $1',
      [analyzeId]
    );

    if (analyzeTypeQuery.rowCount === 0) {
      return res.status(404).json({ message: 'Analyze type not found.' });
    }

    const analyzeName = analyzeTypeQuery.rows[0].analyze_name;
    const targetTable = getTargetTable(analyzeName);

    if (!targetTable) {
      return res.status(400).json({ message: 'Unsupported analyze type.' });
    }

    const mappedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(analyze_data)) {
      if (fieldMapping[key]) {
        mappedData[fieldMapping[key]] = value;
      }
    }

    if (Object.keys(mappedData).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid analyze data provided.' });
    }

    const result = await db.query(
      `INSERT INTO ${targetTable} (assignment_id, student_id, analyze_id, ${Object.keys(
        mappedData
      ).join(', ')}, analyze_date, created_at)
       VALUES ($1, $2, $3, ${Object.values(mappedData)
         .map((_, i) => `$${i + 4}`)
         .join(', ')}, CURRENT_DATE, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assignment_id, student_id, analyzeId, ...Object.values(mappedData)]
    );

    res.status(201).json({
      message: 'Analysis submitted successfully.',
      result: result.rows[0],
    });
  } catch (error) {
    console.error('Ошибка отправки анализа:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/details', async (req: Request, res: Response) => {
  const {
    assignment_id,
    analyze_name,
  }: { assignment_id: string; analyze_name: string } = req.body;

  if (!assignment_id || !analyze_name) {
    return res
      .status(400)
      .json({ message: 'assignment_id и analyze_name обязательны' });
  }

  const targetTable = getTargetTable(analyze_name);

  if (!targetTable) {
    return res.status(400).json({ message: 'Unsupported analyze type.' });
  }

  try {
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
      'analyze_date',
    ];
    const selectedColumns = allColumns
      .filter((col) => !excludedColumns.includes(col))
      .join(', ');

    if (!selectedColumns) {
      return res.status(400).json({ message: 'No valid columns to select.' });
    }

    const resultsQuery = `
        SELECT ${selectedColumns}
        FROM ${targetTable}
        WHERE assignment_id = $1
      `;
    const results = await db.query(resultsQuery, [assignment_id]);

    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No data found for this assignment ID.' });
    }

    const reversedFieldMapping: Record<string, string> = Object.fromEntries(
      Object.entries(fieldMapping).map(([key, value]) => [value, key])
    );

    const translatedResults = translateFields(
      results.rows,
      reversedFieldMapping
    );

    return res.status(200).json({ results: translatedResults });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get("/assignments", async (req, res) => {
  try {
    const query = `
      SELECT 
        aa.assignment_id,
        a.analyze_name,
        aa.scheduled_date,
        aa.assigned_to_team,
        s.first_name AS student_first_name,
        s.last_name AS student_last_name,
        t.team_name
      FROM analyze_assignments aa
      LEFT JOIN analyzes a ON aa.analyze_id = a.analyze_id
      LEFT JOIN students s ON aa.student_id = s.student_id
      LEFT JOIN teams t ON aa.team_id = t.team_id
      ORDER BY aa.scheduled_date DESC;
    `;

    const result = await db.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении списка анализов:", error);
    res.status(500).json({ message: "Ошибка сервера при получении анализов." });
  }
});

// router.get("/assignments", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const offset = (page - 1) * limit;

//     const sortBy = typeof req.query.sortBy === "string" && ["scheduled_date", "analyze_name", "student_first_name", "team_name"].includes(req.query.sortBy)
//       ? req.query.sortBy
//       : "scheduled_date";

//     const sortOrder =
//       typeof req.query.sortOrder === "string" &&
//       req.query.sortOrder.toUpperCase() === "ASC"
//         ? "ASC"
//         : "DESC";

//     const query = `
//       SELECT 
//         aa.assignment_id,
//         a.analyze_name,
//         aa.scheduled_date,
//         aa.assigned_to_team,
//         s.first_name AS student_first_name,
//         s.last_name AS student_last_name,
//         t.team_name
//       FROM analyze_assignments aa
//       LEFT JOIN analyzes a ON aa.analyze_id = a.analyze_id
//       LEFT JOIN students s ON aa.student_id = s.student_id
//       LEFT JOIN teams t ON aa.team_id = t.team_id
//       ORDER BY ${sortBy} ${sortOrder}
//       LIMIT $1 OFFSET $2;
//     `;

//     const countQuery = `
//       SELECT COUNT(*) AS total
//       FROM analyze_assignments aa
//       LEFT JOIN analyzes a ON aa.analyze_id = a.analyze_id
//       LEFT JOIN students s ON aa.student_id = s.student_id
//       LEFT JOIN teams t ON aa.team_id = t.team_id;
//     `;

//     const [result, countResult] = await Promise.all([
//       db.query(query, [limit, offset]),
//       db.query(countQuery),
//     ]);

//     const totalRecords = parseInt(countResult.rows[0].total, 10);

//     res.status(200).json({
//       data: result.rows,
//       pagination: {
//         currentPage: page,
//         pageSize: limit,
//         totalRecords,
//         totalPages: Math.ceil(totalRecords / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Ошибка при получении списка анализов:", error);
//     res.status(500).json({ message: "Ошибка сервера при получении анализов." });
//   }
// });

router.get('/:tableName', async (req: Request, res: Response) => {
  const { tableName } = req.params;

  if (!validTables.has(tableName)) {
    return res.status(400).json({
      message: 'Указанная таблица недопустима или отсутствует.',
    });
  }

  try {
    const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name NOT IN ('result_id', 'assignment_id', 'student_id', 'analyze_id', 'created_at')
      `;
    const columnsResult = await db.query(columnsQuery, [tableName]);

    const columns = columnsResult.rows
      .map((row) => {
        if (row.column_name === 'analyze_date') {
          return `TO_CHAR(${row.column_name}, 'DD.MM.YYYY') AS analyze_date`;
        }
        return row.column_name;
      })
      .join(', ');

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

    const translatedResults = translateFields(
      results.rows,
      reversedFieldMapping
    );

    res.json(translatedResults);
  } catch (error) {
    console.error('Ошибка при запросе к таблице:', error);
    res.status(500).json({
      message: 'Ошибка сервера при получении данных из таблицы.',
    });
  }
});

export default router;
