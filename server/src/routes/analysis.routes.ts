import { Request, Response, Router } from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import { notifyUser } from '../socketServer.js';

const router = Router();

const fieldMapping: Record<string, string> = {
  Гемоглобин: 'hemoglobin',
  Глюкоза: 'glucose',
  Холестерин: 'cholesterol',

  Белок: 'protein',
  Лейкоциты: 'leukocytes',
  Эритроциты: 'erythrocytes',

  Рост: 'height',
  Вес: 'weight',
  'Обхват талии': 'waist_circumference',
  'Обхват бедер': 'hip_circumference',
  ИМТ: 'imt',
  АКМ: 'akm',
  ДАКМ: 'dakm',
  ЖМ: 'jkm',
  ДЖМ: 'djkm',
  СКМ: 'skm',
  ДСКМ: 'dskm',
  ОО: 'oo',
  ОЖ: 'ozh',
  ВЖ: 'vzh',
  ФУ: 'fu',

  АДс: 'ads',
  АДд: 'add',

  ЧСС: 'chss',
  RMSSD: 'rmssd',
  CV: 'cv',
  TP: 'tp',
  HF: 'hf',
  LF: 'lf',
  VLF: 'vlf',
  СФ: 'sf',
  SI: 'si',
  'Тип вегетативной регуляции': 'vegetative_regulation',

  КЧССМ: 'kchs',
  'Максимальная частота движений': 'max_movement_frequency',

  'Кистевая динамометрия (сила)': 'hand_dynamometry_strength',
  'Кистевая динамометрия (выносливость)': 'hand_dynamometry_endurance',
  'Высота прыжка из приседа (SJ)': 'sj_jump_height',
  'Высота прыжка вверх без взмаха руками': 'jump_height_no_hands',
  'Высота прыжка вверх со взмахом руками': 'jump_height_with_hands',
  'CMJ/SJ': 'cmj_sj_ratio',
  'Мощность прыжка': 'jump_power',

  'Проба Ромберга': 'romberg_test',
  'S (о)': 's_o',
  'V (о)': 'v_o',
  'S (з)': 's_z',
  'V (з)': 'v_z',
  'P (о)': 'p_o',
  P3: 'p_z',
  Кэ: 'ke',
  'Динамическая проба': 'dynamic_test',
  'Стресс-проба': 'stress_test',

  ПЗМР: 'pzmr',
  'С����Р': 'sdr',
  РДО: 'rdo',

  'ЧСС покоя': 'chss_resting',
  'Скорость восстановления ЧСС': 'chss_recovery_speed',
  'Приковая ЧСС': 'chss_peak',
  'Показатели ВСР': 'vsr_indicators',

  'Общий объём работы': 'total_work_volume',
  'Пиковое ЧСС': 'peak_chss',
  ЧССАэП: 'chss_aep',
  ЧССАнП: 'chss_anp',
  VO2: 'vo2',
  VO2max: 'vo2_max',
  VO2АэП: 'vo2_aep',
  VO2АнП: 'vo2_anp',
  'Мощность/скорость АэП': 'power_speed_aep',
  'Мощность/скорость АнП': 'power_speed_anp',
  La: 'la',
  ЛВ: 'lv',
  ДК: 'dk',

  'ЧСС (ортостатическая проба)': 'chss',
  'ЧСС (контрольные поединки)': 'chss',

  'Назначен на дату': 'analyze_date',
  Имя: 'first_name',
  Фамилия: 'last_name',
  Отчество: 'middle_name',
  Спорт: 'sport_name',
  Команда: 'team_name',
};

const validTables = new Set([
  'anthropometry_bioimpedance',
  'blood_clinical_analysis',
  'urine_clinical_analysis',
  'tonometry',
  'rhythmocardiography',
  'frequencymetry',
  'speed_strength_qualities',
  'chronoreflectometry',
  'stabilometry',
  'squat_test',
  'ergometric_tests',
  'orthostatic_test',
  'special_functional_tests',
]);

function getTargetTable(analyzeName: string): string | null {
  const tableMap: Record<string, string> = {
    'Антропометрия и биоимпедансометрия': 'anthropometry_bioimpedance',
    'Клинический анализ крови': 'blood_clinical_analysis',
    'Клинический анализ мочи': 'urine_clinical_analysis',
    'Тонометрия': 'tonometry',
    'Ритмокардиография': 'rhythmocardiography',
    'Частометрия': 'frequencymetry',
    'Скоростно-силовые и силовые качества': 'speed_strength_qualities',
    'Хронорефлексометрия': 'chronoreflectometry',
    'Стабилометрия': 'stabilometry',
    'Проба с приседаниями': 'squat_test',
    'Эргометрические тесты': 'ergometric_tests',
    'Ортостатическая проба': 'orthostatic_test',
    'Специальные функциональные пробы': 'special_functional_tests',
  };

  return tableMap[analyzeName] || null;
}

router.post('/assign', async (req: Request, res: Response) => {
  const { analyze_id, sport_id, team_id, student_id, due_date } = req.body;

  if (!analyze_id || !sport_id || !due_date || (!team_id && !student_id)) {
    return res.status(400).json({
      message:
        'Analyze ID, sport ID, due date, and either team or student ID are required.',
    });
  }

  try {
    // Проверка существования анализа, спорта, команды и студента
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

    // Назначение анализа
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
        "SELECT analyze_name FROM analyzes WHERE analyze_id = $1",
        [analyze_id]
      );
    
      const analyzeName = analyzeNameQuery.rows[0]?.analyze_name || "Неизвестный анализ";
      let scheduled_date = due_date;
    
      // Уведомляем пользователя
      notifyUser(student_id, {
        type: 'NEW_ANALYSIS',
        data: {
          assignment_id: result.rows[0].assignment_id,
          analyze_id,
          analyze_name: analyzeName, // Добавляем название анализа
          scheduled_date,
          assigned_to_team: !!team_id, // Проставляем флаг, если назначено команде
        },
      });

      console.log(student_id, {
        type: 'NEW_ANALYSIS',
        data: {
          assignment_id: result.rows[0].assignment_id,
          analyze_id,
          analyze_name: analyzeName, // Добавляем название анализа
          due_date,
          assigned_to_team: !!team_id, // Проставляем флаг, если назначено команде
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
        "SELECT analyze_name FROM analyzes WHERE analyze_id = $1",
        [analyze_id]
      );

      const analyzeName = analyzeNameQuery.rows[0]?.analyze_name || "Неизвестный анализ";
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

        console.log(`Notification sent to student ${member.student_id}`);
        console.log(student_id, {
          type: 'NEW_ANALYSIS',
          data: {
            assignment_id: result.rows[0].assignment_id,
            analyze_id,
            due_date,
            assigned_to_team: !!team_id,
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
    const targetTable = getTargetTable(analyzeName); // Вспомогательная функция

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

    const translatedResults = results.rows.map((row) => {
      const translatedRow: Record<string, string> = {};
      for (const key in row) {
        const translatedKey = reversedFieldMapping[key] || key;
        translatedRow[translatedKey] = row[key];
      }
      return translatedRow;
    });

    return res.status(200).json({ results: translatedResults });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

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

    const translatedResults = results.rows.map((row) => {
      const translatedRow: Record<string, string> = {};
      for (const key in row) {
        const translatedKey = reversedFieldMapping[key] || key;
        translatedRow[translatedKey] = row[key];
      }
      return translatedRow;
    });

    res.json(translatedResults);
  } catch (error) {
    console.error('Ошибка при запросе к таблице:', error);
    res.status(500).json({
      message: 'Ошибка сервера при получении данных из таблицы.',
    });
  }
});

export default router;
