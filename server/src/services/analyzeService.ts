import db from '../db.js';
import { notifyUser } from '../socketServer.js';
import { getTargetTable, fieldMapping, translateFields } from '../utils/vocabulary.js';

interface Student {
  first_name: string;
  last_name: string;
  middle_name: string;
  sport_name: string;
  team_name: string | null;
  parameters: { 
    parameter_name: string;
    value: string;
    unit: string;
    is_normal: boolean;
  }[];
}

export class AnalyzeService {
  // static async getUserAnalyses(student_id: string) {
  //   const userAnalysesQuery = `
  //     SELECT
  //       aa.assignment_id,
  //       a.analyze_name,
  //       a.analysis_table,
  //       aa.scheduled_date,
  //       aa.assigned_to_team
  //     FROM analyze_assignments aa
  //     JOIN analyzes a ON aa.analyze_id = a.analyze_id
  //     WHERE aa.student_id = $1
  //     AND aa.assigned_to_team = false
  //   `;
  //   const userAnalyses = await db.query(userAnalysesQuery, [student_id]);

  //   const teamAnalysesQuery = `
  //     SELECT
  //       aa.assignment_id,
  //       a.analyze_name,
  //       a.analysis_table,
  //       aa.scheduled_date,
  //       aa.assigned_to_team
  //     FROM analyze_assignments aa
  //     JOIN analyzes a ON aa.analyze_id = a.analyze_id
  //     JOIN students s ON aa.team_id = s.team_id
  //     WHERE s.student_id = $1
  //     AND aa.assigned_to_team = true
  //   `;
  //   const teamAnalyses = await db.query(teamAnalysesQuery, [student_id]);

  //   const allAnalyses = [...userAnalyses.rows, ...teamAnalyses.rows];

  //   return await Promise.all(
  //     allAnalyses.map(async (analysis) => {
  //       const { assignment_id, analysis_table } = analysis;

  //       if (!analysis_table) {
  //         return { ...analysis, is_submitted: false };
  //       }

  //       const resultCheckQuery = `
  //         SELECT 1 FROM ${analysis_table} WHERE assignment_id = $1 AND student_id = $2
  //       `;
  //       const resultCheck = await db.query(resultCheckQuery, [assignment_id, student_id]);

  //       return {
  //         ...analysis,
  //         is_submitted: resultCheck?.rowCount ?? false,
  //       };
  //     })
  //   );
  // }


  static async getUserAnalyses(student_id: string) {
  // Запрос для анализов, назначенных конкретному студенту
  const userAnalysesQuery = `
    SELECT
      aa.assignment_id,
      a.analyze_name,
      aa.scheduled_date,
      aa.assigned_to_team,
      a.analyze_id
    FROM analyze_assignments aa
    JOIN analyzes a ON aa.analyze_id = a.analyze_id
    WHERE aa.student_id = $1
    AND aa.assigned_to_team = false
  `;
  const userAnalyses = await db.query(userAnalysesQuery, [student_id]);

  // Запрос для анализов, назначенных команде студента
  const teamAnalysesQuery = `
    SELECT
      aa.assignment_id,
      a.analyze_name,
      aa.scheduled_date,
      aa.assigned_to_team,
      a.analyze_id
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
      const { assignment_id, analyze_id, analyze_name } = analysis;

      if (!analyze_id) {
        return { ...analysis, is_submitted: false };
      }

      // Проверка сданности анализа через таблицу analysis_results
      const resultCheckQuery = `
        SELECT 1 FROM analysis_results 
        WHERE assignment_id = $1 
        AND student_id = $2 
        AND analyze_id = $3
      `;
      const resultCheck = await db.query(resultCheckQuery, [assignment_id, student_id, analyze_id]);

      return {
        ...analysis,
        is_submitted: resultCheck?.rowCount ?? false, // Если результаты найдены, анализ считается сданным
      };
    })
  );
}

  // static async submitAnalysis(student_id: string, assignment_id: string, analyze_data: Record<string, any>) {
  //   console.log(analyze_data);
  //   const assignmentCheck = await db.query(
  //     'SELECT * FROM analyze_assignments WHERE assignment_id = $1',
  //     [assignment_id]
  //   );

  //   if (assignmentCheck.rowCount === 0) {
  //     throw new Error('Assignment not found.');
  //   }

  //   const analyzeId = assignmentCheck.rows[0].analyze_id;

  //   const analyzeTypeQuery = await db.query(
  //     'SELECT analyze_name FROM analyzes WHERE analyze_id = $1',
  //     [analyzeId]
  //   );

  //   if (analyzeTypeQuery.rowCount === 0) {
  //     throw new Error('Analyze type not found.');
  //   }

  //   const analyzeName = analyzeTypeQuery.rows[0].analyze_name;
  //   const targetTable = getTargetTable(analyzeName);

  //   if (!targetTable) {
  //     throw new Error('Unsupported analyze type.');
  //   }

  //   const mappedData: Record<string, any> = {};
  //   for (const [key, value] of Object.entries(analyze_data)) {
  //     if (fieldMapping[key]) {
  //       mappedData[fieldMapping[key]] = value;
  //     }
  //   }

  //   if (Object.keys(mappedData).length === 0) {
  //     throw new Error('No valid analyze data provided.');
  //   }

  //   const result = await db.query(
  //     `INSERT INTO ${targetTable} (assignment_id, student_id, analyze_id, ${Object.keys(mappedData).join(', ')}, analyze_date, created_at)
  //      VALUES ($1, $2, $3, ${Object.values(mappedData).map((_, i) => `$${i + 4}`).join(', ')}, CURRENT_DATE, CURRENT_TIMESTAMP)
  //      RETURNING *`,
  //     [assignment_id, student_id, analyzeId, ...Object.values(mappedData)]
  //   );

  //   return result.rows[0];
  // }

  static async submitAnalysis(student_id: string, assignment_id: string, analyze_data: Record<string, any>) {
    console.log(analyze_data);
  
    // Проверка наличия назначения
    const assignmentCheck = await db.query(
      'SELECT * FROM analyze_assignments WHERE assignment_id = $1',
      [assignment_id]
    );
  
    if (assignmentCheck.rowCount === 0) {
      throw new Error('Assignment not found.');
    }
  
    const analyzeId = assignmentCheck.rows[0].analyze_id;
  
    // Получаем тип анализа
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
    const resultsToInsert: Array<any> = [];
  
    // Маппинг данных
    for (const [key, value] of Object.entries(analyze_data)) {
      if (fieldMapping[key]) {
        mappedData[fieldMapping[key]] = value;
  
        // Получаем parameter_id для каждого параметра
        const parameterQuery = await db.query(
          'SELECT parameter_id, unit FROM analysis_parameters WHERE parameter_name = $1 AND analyze_id = $2',
          [key, analyzeId]
        );
  
        if (parameterQuery.rowCount === 0) {
          throw new Error(`Parameter ${key} not found for this analyze.`);
        }
  
        const { parameter_id, unit } = parameterQuery.rows[0];
  
        // Получаем норму для параметра из таблицы reference_values_text
        const referenceQuery = await db.query(
          'SELECT lower_bound, upper_bound FROM reference_values WHERE parameter_id = $1 AND analyze_id = $2',
          [parameter_id, analyzeId]
        );
  
        let isNormal = null;
  
        if (referenceQuery) {
          const reference = referenceQuery.rows[0];
          if (reference) {
            const { lower_bound, upper_bound } = reference;
            isNormal = value >= lower_bound && value <= upper_bound;
          } else {
            console.warn('Reference not found in database');
          }
        } else {
          console.warn('Database query returned no results');
        }
  
        // Добавление в результаты
        resultsToInsert.push({
          analyze_id: analyzeId,
          assignment_id: assignment_id,
          student_id: student_id,
          parameter_id: parameter_id,
          value: value,
          is_normal: isNormal,
          created_at: new Date(),
        });
      }
    }
  
    if (resultsToInsert.length === 0) {
      throw new Error('No valid analyze data provided.');
    }
  
    // Вставка всех результатов анализов
    const query = `
      INSERT INTO analysis_results (analyze_id, assignment_id, student_id, parameter_id, value, is_normal, created_at)
      VALUES ${resultsToInsert.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(', ')}
      RETURNING *`;
  
    const resultValues = resultsToInsert.flatMap((entry) => [
      entry.analyze_id,
      entry.assignment_id,
      entry.student_id,
      entry.parameter_id,
      entry.value,
      entry.is_normal,
      entry.created_at,
    ]);
  
    const result = await db.query(query, resultValues);
  
    return result.rows;
  }
  

  // static async getDetailedResults(assignment_id: string, analyze_id: string) {
  //   const targetTable = getTargetTable(analyze_name);
  //   if (!targetTable) {
  //     throw new Error('Unsupported analyze type.');
  //   }

  //   const columnsQuery = `
  //       SELECT column_name
  //       FROM information_schema.columns
  //       WHERE table_name = $1
  //   `;
  //   const columnsResult = await db.query(columnsQuery, [targetTable]);
  //   const allColumns: string[] = columnsResult.rows.map((row) => row.column_name);

  //   const excludedColumns = ['created_at', 'result_id', 'assignment_id', 'student_id', 'analyze_id', 'analyze_date'];
  //   const selectedColumns = allColumns.filter((col) => !excludedColumns.includes(col)).join(', ');

  //   if (!selectedColumns) {
  //     throw new Error('No valid columns to select.');
  //   }

  //   const resultsQuery = `SELECT ${selectedColumns} FROM ${targetTable} WHERE assignment_id = $1`;
  //   const results = await db.query(resultsQuery, [assignment_id]);

  //   if (results.rows.length === 0) {
  //     throw new Error('No data found for this assignment ID.');
  //   }

  //   const reversedFieldMapping: Record<string, string> = Object.fromEntries(
  //     Object.entries(fieldMapping).map(([key, value]) => [value, key])
  //   );

  //   return translateFields(results.rows, reversedFieldMapping);
  // }

  static async getDetailedResults(assignment_id: string, analyze_id: string) {
    // Получаем все параметры для данного analyze_id из таблицы analysis_parameters
    const parametersQuery = `
      SELECT parameter_id, parameter_name, unit 
      FROM analysis_parameters
      WHERE analyze_id = $1
    `;
    const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
    if (parametersResult.rowCount === 0) {
      throw new Error('No parameters found for this analyze type.');
    }
  
    // Извлекаем все parameter_ids для данного analyze_id
    const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
    // Запрос на результаты для каждого параметра
    const resultsQuery = `
      SELECT parameter_id, value, is_normal, created_at 
      FROM analysis_results
      WHERE assignment_id = $1
      AND analyze_id = $2
      AND parameter_id = ANY($3::uuid[])
    `;
    const results = await db.query(resultsQuery, [assignment_id, analyze_id, parameterIds]);
  
    if (results.rowCount === 0) {
      throw new Error('No results found for this assignment ID and analyze type.');
    }
  
    // Преобразуем результаты для соответствующих параметров
    const translatedResults = results.rows.map((result) => {
      const parameter = parametersResult.rows.find((param) => param.parameter_id === result.parameter_id);
      return {
        ...result,
        parameter_name: parameter ? parameter.parameter_name : 'Unknown Parameter',
        unit: parameter ? parameter.unit : 'Unknown Unit',
      };
    });
  
    return translatedResults;
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

  // static async getTableData(tableName: string) {
  //   const columnsQuery = `
  //     SELECT column_name
  //     FROM information_schema.columns
  //     WHERE table_name = $1
  //     AND column_name NOT IN ('result_id', 'assignment_id', 'student_id', 'analyze_id', 'created_at')
  //   `;
  //   const columnsResult = await db.query(columnsQuery, [tableName]);

  //   const columns = columnsResult.rows.map((row) =>
  //     row.column_name === "analyze_date" ? `TO_CHAR(${row.column_name}, 'DD.MM.YYYY') AS analyze_date` : row.column_name
  //   ).join(', ');

  //   if (!columns) throw new Error("No valid columns to select.");

  //   const query = `
  //     SELECT 
  //         s.first_name,
  //         s.last_name,
  //         s.middle_name,
  //         sp.sport_name,
  //         t.team_name,
  //         ${columns}
  //     FROM ${tableName} r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id;
  //   `;

  //   const results = await db.query(query);

  //   const reversedFieldMapping: Record<string, string> = Object.fromEntries(
  //     Object.entries(fieldMapping).map(([key, value]) => [value, key])
  //   );

  //   return translateFields(results.rows, reversedFieldMapping);
  // }


  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на результаты для каждого параметра, ассоциированного с данным analyze_id
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name 
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   if (results.rowCount === 0) {
  //     throw new Error('No results found for this analyze ID.');
  //   }
  
  //   // Преобразуем результаты для соответствующих параметров
  //   const translatedResults = results.rows.map((result) => {
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === result.parameter_id);
  //     return {
  //       ...result,
  //       parameter_name: parameter ? parameter.parameter_name : 'Unknown Parameter',
  //       unit: parameter ? parameter.unit : 'Unknown Unit',
  //     };
  //   });
  
  //   return translatedResults;
  // }
  
  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на результаты для каждого параметра, ассоциированного с данным analyze_id
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name 
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   if (results.rowCount === 0) {
  //     throw new Error('No results found for this analyze ID.');
  //   }
  
  //   // Сгруппируем результаты по студентам
  //   const groupedResults: Record<string, Student> = results.rows.reduce((acc, result) => {
  //     const { student_id, first_name, last_name, middle_name, sport_name, team_name, parameter_id, value, unit } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  
  //     // Если студент еще не добавлен в результат, добавляем
  //     if (!acc[student_id]) {
  //       acc[student_id] = {
  //         first_name,
  //         last_name,
  //         middle_name,
  //         sport_name,
  //         team_name,
  //         parameters: [],
  //       };
  //     }
  
  //     // Добавляем параметры для студента
  //     acc[student_id].parameters.push({
  //       parameter_name: parameter ? parameter.parameter_name : 'Unknown Parameter',
  //       value,
  //       unit: parameter ? parameter.unit : 'Unknown Unit',
  //       is_normal: result.is_normal,
  //     });
  
  //     return acc;
  //   }, {});
  
  //   // Преобразуем результат в нужный формат
  //   const finalResults = Object.values(groupedResults).map((student) => ({
  //     "Имя": student.first_name,
  //     "Фамилия": student.last_name,
  //     "Отчество": student.middle_name,
  //     "Спорт": student.sport_name,
  //     "Команда": student.team_name,
  //     "Параметры": student.parameters.map(param => ({
  //       "Параметр": param.parameter_name,
  //       "Значение": param.value,
  //       "Единица измерения": param.unit,
  //       "Норма": param.is_normal ? "В пределах нормы" : "Не в пределах нормы",
  //     })),
  //   }));
  
  //   return finalResults;
  // }


  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на все результаты для данного анализа
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name 
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   if (results.rowCount === 0) {
  //     throw new Error('No results found for this analyze ID.');
  //   }
  
  //   // Сгруппируем результаты по студентам и анализам
  //   const finalResults: any[] = [];
  
  //   results.rows.forEach((result) => {
  //     const {
  //       student_id,
  //       first_name,
  //       last_name,
  //       middle_name,
  //       sport_name,
  //       team_name,
  //       parameter_id,
  //       value,
  //       created_at,
  //     } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  
  //     const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
  //     // Ищем существующий результат для студента
  //     const existingResult = finalResults.find(
  //       (item) => item["Имя"] === first_name && item["Фамилия"] === last_name && item["Отчество"] === middle_name
  //     );
  
  //     if (!existingResult) {
  //       finalResults.push({
  //         "Имя": first_name,
  //         "Фамилия": last_name,
  //         "Отчество": middle_name,
  //         "Спорт": sport_name,
  //         "Команда": team_name,
  //         "Назначен на дату": created_at, // Добавляем дату назначения
  //         [parameterName]: {
  //           Значение: value,
  //           Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //           Дата: created_at,
  //         },
  //       });
  //     } else {
  //       // Добавляем данные для уже существующего анализа
  //       if (!existingResult[parameterName]) {
  //         existingResult[parameterName] = {
  //           Значение: value,
  //           Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //           Дата: created_at,
  //         };
  //       } else {
  //         // В случае повторных значений, добавляем их в массив
  //         if (!Array.isArray(existingResult[parameterName])) {
  //           existingResult[parameterName] = [
  //             existingResult[parameterName], // Сначала добавляем старое значение
  //             {
  //               Значение: value,
  //               Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //               Дата: created_at,
  //             },
  //           ];
  //         } else {
  //           existingResult[parameterName].push({
  //             Значение: value,
  //             Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //             Дата: created_at,
  //           });
  //         }
  //       }
  //     }
  //   });
  
  //   return finalResults;
  // }

  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на все результаты для данного анализа
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name, r.assignment_id
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   if (results.rowCount === 0) {
  //     throw new Error('No results found for this analyze ID.');
  //   }
  
  //   // Сгруппируем данные по assignment_id (по назначению)
  //   const finalResults = [];
  
  //   results.rows.forEach((result) => {
  //     const {
  //       assignment_id,
  //       student_id,
  //       first_name,
  //       last_name,
  //       middle_name,
  //       sport_name,
  //       team_name,
  //       parameter_id,
  //       value,
  //       created_at
  //     } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  //     const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
  //     // Находим или создаем запись для текущего assignment_id
  //     let assignmentResult = finalResults.find((entry) => entry.assignment_id === assignment_id);
  
  //     if (!assignmentResult) {
  //       assignmentResult = {
  //         "Имя": first_name,
  //         "Фамилия": last_name,
  //         "Отчество": middle_name,
  //         "Спорт": sport_name,
  //         "Команда": team_name,
  //         "Назначен на дату": created_at,
  //         assignment_id,
  //         parameters: {},
  //       };
  //       finalResults.push(assignmentResult);
  //     }
  
  //     // Добавляем параметр для данного назначения (например, АДс, АДд)
  //     assignmentResult.parameters[parameterName] = {
  //       Значение: value,
  //       Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //       Дата: created_at
  //     };
  //   });
  
  //   // Преобразуем результат для возвращения
  //   return finalResults;
  // }


  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на все результаты для данного анализа
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name, r.assignment_id
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   if (results.rowCount === 0) {
  //     throw new Error('No results found for this analyze ID.');
  //   }
  
  //   // Сгруппируем данные по assignment_id
  //   const finalResults = [];
  
  //   results.rows.forEach((result) => {
  //     const {
  //       assignment_id,
  //       student_id,
  //       first_name,
  //       last_name,
  //       middle_name,
  //       sport_name,
  //       team_name,
  //       parameter_id,
  //       value,
  //       created_at
  //     } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  //     const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
  //     // Находим или создаем запись для текущего assignment_id
  //     let assignmentResult = finalResults.find((entry) => entry.assignment_id === assignment_id);
  
  //     if (!assignmentResult) {
  //       assignmentResult = {
  //         "Имя": first_name,
  //         "Фамилия": last_name,
  //         "Отчество": middle_name,
  //         "Спорт": sport_name,
  //         "Команда": team_name,
  //         "Назначен на дату": created_at,
  //         assignment_id,
  //       };
  //       finalResults.push(assignmentResult);
  //     }
  
  //     // Добавляем параметр для данного назначения (например, АДс, АДд)
  //     assignmentResult[parameterName] = {
  //       Значение: value,
  //       Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //     };
  //   });
  
  //   // Преобразуем результат для возвращения
  //   return finalResults;
  // }


  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Запрос на все результаты для данного анализа
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name, r.assignment_id
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
   
  //   // Сгруппируем данные по assignment_id
  //   const finalResults = [];
  
  //   results.rows.forEach((result) => {
  //     const {
  //       assignment_id,
  //       student_id,
  //       first_name,
  //       last_name,
  //       middle_name,
  //       sport_name,
  //       team_name,
  //       parameter_id,
  //       value,
  //       created_at
  //     } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  //     const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
  //     // Находим или создаем запись для текущего assignment_id
  //     let assignmentResult = finalResults.find((entry) => entry.assignment_id === assignment_id);
  
  //     if (!assignmentResult) {
  //       assignmentResult = {
  //         "Имя": first_name,
  //         "Фамилия": last_name,
  //         "Отчество": middle_name,
  //         "Спорт": sport_name,
  //         "Команда": team_name,
  //         "Дата сдачи": created_at,  // Изменили на дату сдачи
  //         assignment_id,
  //       };
  //       finalResults.push(assignmentResult);
  //     }
  
  //     // Добавляем параметр для данного назначения (например, АДс, АДд)
  //     assignmentResult[parameterName] = {
  //       Значение: value,
  //       Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //     };
  //   });
  
  //   // Преобразуем результат для возвращения
  //   return finalResults;
  // }
  

  // static async getTableData(analyze_id: string) {
  //   // Получаем все параметры для данного analyze_id
  //   const parametersQuery = `
  //     SELECT parameter_id, parameter_name, unit
  //     FROM analysis_parameters
  //     WHERE analyze_id = $1
  //   `;
  //   const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
  //   if (parametersResult.rowCount === 0) {
  //     throw new Error('No parameters found for this analyze ID.');
  //   }
  
  //   // Извлекаем все parameter_ids для данного analyze_id
  //   const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
  //   // Получаем нормы из таблицы reference_values (с объединением с analysis_parameters для названия параметра)
  //   const normsQuery = `
  //     SELECT rv.parameter_id, p.parameter_name, rv.lower_bound, rv.upper_bound, rv.gender, p.unit
  //     FROM reference_values rv
  //     JOIN analysis_parameters p ON rv.parameter_id = p.parameter_id
  //     WHERE rv.analyze_id = $1
  //   `;
  //   const normsResult = await db.query(normsQuery, [analyze_id]);
  
  //   // Формируем объект норм: ключ – имя параметра, значение – объект с нижней и верхней границей, а также, например, единицами измерения и полом
  //   const normsData: { [key: string]: any } = {};
  //   normsResult.rows.forEach((norm) => {
  //     normsData[norm.parameter_name] = {
  //       lower_bound: norm.lower_bound,
  //       upper_bound: norm.upper_bound,
  //       gender: norm.gender,
  //       unit: norm.unit,
  //     };
  //   });
  
  //   // Запрос на все результаты для данного анализа
  //   const resultsQuery = `
  //     SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name, r.assignment_id
  //     FROM analysis_results r
  //     LEFT JOIN students s ON r.student_id = s.student_id
  //     LEFT JOIN teams t ON s.team_id = t.team_id
  //     LEFT JOIN sports sp ON s.sport_id = sp.sport_id
  //     WHERE r.analyze_id = $1
  //     AND r.parameter_id = ANY($2::uuid[])
  //   `;
  //   const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
  //   // Группируем данные по assignment_id
  //   const finalResults: any[] = [];
  
  //   // Добавляем первую запись с нормами
  //   finalResults.push({ "Нормы": normsData });
  
  //   results.rows.forEach((result) => {
  //     const {
  //       assignment_id,
  //       first_name,
  //       last_name,
  //       middle_name,
  //       sport_name,
  //       team_name,
  //       parameter_id,
  //       value,
  //       created_at
  //     } = result;
  
  //     // Находим параметр по parameter_id
  //     const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
  //     const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
  //     // Ищем или создаем запись для текущего assignment_id
  //     let assignmentResult = finalResults.find((entry) => entry.assignment_id === assignment_id);
  //     if (!assignmentResult) {
  //       assignmentResult = {
  //         "Имя": first_name,
  //         "Фамилия": last_name,
  //         "Отчество": middle_name,
  //         "Спорт": sport_name,
  //         "Команда": team_name,
  //         "Дата сдачи": created_at,
  //         assignment_id,
  //       };
  //       finalResults.push(assignmentResult);
  //     }
  
  //     // Добавляем параметр с его значением и единицами измерения для данного назначения
  //     assignmentResult[parameterName] = {
  //       Значение: value,
  //       Единицы: parameter ? parameter.unit : 'Unknown Unit',
  //     };
  //   });
  
  //   return finalResults;
  // }
  
  
  static async getTableData(analyze_id: string) {
    // Получаем все параметры для данного analyze_id
    const parametersQuery = `
      SELECT parameter_id, parameter_name, unit
      FROM analysis_parameters
      WHERE analyze_id = $1
    `;
    const parametersResult = await db.query(parametersQuery, [analyze_id]);
  
    if (parametersResult.rowCount === 0) {
      throw new Error('No parameters found for this analyze ID.');
    }
  
    // Извлекаем все parameter_ids для данного analyze_id
    const parameterIds = parametersResult.rows.map((row) => row.parameter_id);
  
    // Получаем нормы из таблицы reference_values (с объединением с analysis_parameters для названия параметра)
    const normsQuery = `
      SELECT rv.parameter_id, p.parameter_name, rv.lower_bound, rv.upper_bound, rv.gender, p.unit
      FROM reference_values rv
      JOIN analysis_parameters p ON rv.parameter_id = p.parameter_id
      WHERE rv.analyze_id = $1
    `;
    const normsResult = await db.query(normsQuery, [analyze_id]);
  
    // Формируем объект норм: ключ – имя параметра, значение – объект с нижней и верхней границей, а также единицами и полом
    const normsData: { [key: string]: any } = {};
    normsResult.rows.forEach((norm) => {
      normsData[norm.parameter_name] = {
        lower_bound: norm.lower_bound,
        upper_bound: norm.upper_bound,
        gender: norm.gender,
        unit: norm.unit,
      };
    });
  
    // Запрос на все результаты для данного анализа
    const resultsQuery = `
      SELECT r.parameter_id, r.value, r.is_normal, r.created_at, s.first_name, s.last_name, s.middle_name, sp.sport_name, t.team_name, r.assignment_id
      FROM analysis_results r
      LEFT JOIN students s ON r.student_id = s.student_id
      LEFT JOIN teams t ON s.team_id = t.team_id
      LEFT JOIN sports sp ON s.sport_id = sp.sport_id
      WHERE r.analyze_id = $1
      AND r.parameter_id = ANY($2::uuid[])
    `;
    const results = await db.query(resultsQuery, [analyze_id, parameterIds]);
  
    // Группируем данные по assignment_id
    const finalResults: any[] = [];
  
    // Добавляем первую запись с нормами
    finalResults.push({ "Нормы": normsData });
  
    results.rows.forEach((result) => {
      const {
        assignment_id,
        first_name,
        last_name,
        middle_name,
        sport_name,
        team_name,
        parameter_id,
        value,
        created_at,
        is_normal
      } = result;
  
      // Находим параметр по parameter_id
      const parameter = parametersResult.rows.find((param) => param.parameter_id === parameter_id);
      const parameterName = parameter ? parameter.parameter_name : `Unknown ${parameter_id}`;
  
      // Ищем или создаем запись для текущего assignment_id
      let assignmentResult = finalResults.find((entry) => entry.assignment_id === assignment_id);
      if (!assignmentResult) {
        assignmentResult = {
          "Имя": first_name,
          "Фамилия": last_name,
          "Отчество": middle_name,
          "Спорт": sport_name,
          "Команда": team_name,
          "Дата сдачи": created_at,
          assignment_id,
        };
        finalResults.push(assignmentResult);
      }
  
      // Добавляем параметр с его значением, единицами измерения и is_normal для данного назначения
      assignmentResult[parameterName] = {
        Значение: value,
        is_normal: is_normal
      };
    });
  
    return finalResults;
  }
  
  
  
  
  
  
  
  
    
  
  

  

}
