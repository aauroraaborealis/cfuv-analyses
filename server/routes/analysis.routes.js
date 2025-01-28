const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken'); // Для создания токена
require('dotenv').config();
const { notifyUser } = require('../socketServer');

const fieldMapping = {
  Гемоглобин: "hemoglobin",
  Глюкоза: "glucose",
  Холестерин: "cholesterol",

  Белок: "protein",
  Лейкоциты: "leukocytes",
  Эритроциты: "erythrocytes",
  // Anthropometry and bioimpedance
  "Рост": "height",
  "Вес": "weight",
  "Обхват талии": "waist_circumference",
  "Обхват бедер": "hip_circumference",
  "ИМТ": "imt",
  "АКМ": "akm",
  "ДАКМ": "dakm",
  "ЖМ": "jkm",
  "ДЖМ": "djkm",
  "СКМ": "skm",
  "ДСКМ": "dskm",
  "ОО": "oo",
  "ОЖ": "ozh",
  "ВЖ": "vzh",
  "ФУ": "fu",

  // Tonometry
  "АДс": "ads",
  "АДд": "add",

  // Rhythmocardiography
  "ЧСС": "chss",
  "RMSSD": "rmssd",
  "CV": "cv",
  "TP": "tp",
  "HF": "hf",
  "LF": "lf",
  "VLF": "vlf",
  "СФ": "sf",
  "SI": "si",
  "Тип вегетативной регуляции": "vegetative_regulation",

  // Frequencymetry
  "КЧССМ": "kchs",
  "Максимальная частота движений": "max_movement_frequency",

  // Speed-strength qualities
  "Кистевая динамометрия (сила)": "hand_dynamometry_strength",
  "Кистевая динамометрия (выносливость)": "hand_dynamometry_endurance",
  "Высота прыжка из приседа (SJ)": "sj_jump_height",
  "Высота прыжка вверх без взмаха руками": "jump_height_no_hands",
  "Высота прыжка вверх со взмахом руками": "jump_height_with_hands",
  "CMJ/SJ": "cmj_sj_ratio",
  "Мощность прыжка": "jump_power",

  // Stabilometry
  "Проба Ромберга": "romberg_test",
  "S (о)": "s_o",
  "V (о)": "v_o",
  "S (з)": "s_z",
  "V (з)": "v_z",
  "P (о)": "p_o",
  "P3": "p_z",
  "Кэ": "ke",
  "Динамическая проба": "dynamic_test",
  "Стресс-проба": "stress_test",

  // Chronoreflectometry
  "ПЗМР": "pzmr",
  "СДР": "sdr",
  "РДО": "rdo",

      // New mappings for Squat Test
  "ЧСС покоя": "chss_resting",
  "Скорость восстановления ЧСС": "chss_recovery_speed",
  "Приковая ЧСС": "chss_peak",
  "Показатели ВСР": "vsr_indicators",

  // New mappings for Ergometric Tests
  "Общий объём работы": "total_work_volume",
  ЧСС: "chss",
  "Пиковое ЧСС": "peak_chss",
  "ЧССАэП": "chss_aep",
  "ЧССАнП": "chss_anp",
  VO2: "vo2",
  VO2max: "vo2_max",
  "VO2АэП": "vo2_aep",
  "VO2АнП": "vo2_anp",
  "Мощность/скорость АэП": "power_speed_aep",
  "Мощность/скорость АнП": "power_speed_anp",
  La: "la",
  ЛВ: "lv",
  ДК: "dk",

  // New mappings for Orthostatic Test
  "ЧСС (ортостатическая проба)": "chss",
  "АДс": "ads",
  "АДд": "add",

  // New mappings for Special Functional Tests
  "ЧСС (контрольные поединки)": "chss",
  "La": "la",

  "Назначен на дату":"analyze_date",
  "Имя": "first_name",
  "Фамилия": "last_name",
  "Отчество": "middle_name",
  "Спорт": "sport_name",
  "Команда": "team_name",
				
};

router.post("/assign", async (req, res) => {
  const { analyze_id, sport_id, team_id, student_id, due_date } = req.body;

  // Проверяем обязательные поля
  if (!analyze_id || !sport_id || !due_date || (!team_id && !student_id)) {
    return res.status(400).json({
      message: "Analyze ID, sport ID, due date, and either team or student ID are required.",
    });
  }

  try {
    // Проверяем, существует ли указанный анализ
    const analyzeCheck = await db.query(
      "SELECT analyze_id FROM analyzes WHERE analyze_id = $1",
      [analyze_id]
    );
    if (analyzeCheck.rowCount === 0) {
      return res.status(404).json({ message: "Analyze type not found." });
    }

    // Проверяем, существует ли указанный вид спорта
    const sportCheck = await db.query(
      "SELECT sport_id FROM sports WHERE sport_id = $1",
      [sport_id]
    );
    if (sportCheck.rowCount === 0) {
      return res.status(404).json({ message: "Sport not found." });
    }

    // Логика для команды
    if (team_id) {
      const teamCheck = await db.query(
        "SELECT team_id FROM teams WHERE team_id = $1",
        [team_id]
      );
      if (teamCheck.rowCount === 0) {
        return res.status(404).json({ message: "Team not found." });
      }
    }

    // Логика для пользователя
    if (student_id) {
      const studentCheck = await db.query(
        "SELECT student_id FROM students WHERE student_id = $1",
        [student_id]
      );
      if (studentCheck.rowCount === 0) {
        return res.status(404).json({ message: "Student not found." });
      }
    }

    // Вставляем запись
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
      !!team_id, // assigned_to_team = true, если team_id передан
    ];
    const result = await db.query(query, values);

    if (student_id) {
      // Получаем название анализа
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
          due_date,
          assigned_to_team: !!team_id, // Проставляем флаг, если назначено команде
        },
      });

      console.log(student_id, {
        type: 'NEW_ANALYSIS',
        data: {
          assignment_id: result.rows[0].assignment_id,
          analyze_id,
          analyze_name: analyzeName, // Добавляем название анализа
          scheduled_date,
          assigned_to_team: !!team_id, // Проставляем флаг, если назначено команде
        },
      });
    }

    if (team_id) {
      // Получаем всех студентов, входящих в команду
      const teamMembersQuery = await db.query(
        "SELECT student_id FROM students WHERE team_id = $1",
        [team_id]
      );

      const analyzeNameQuery = await db.query(
        "SELECT analyze_name FROM analyzes WHERE analyze_id = $1",
        [analyze_id]
      );
    
      const analyzeName = analyzeNameQuery.rows[0]?.analyze_name || "Неизвестный анализ";
    
      const teamMembers = teamMembersQuery.rows;
    
      for (const member of teamMembers) {
        notifyUser(member.student_id, {
          type: 'NEW_ANALYSIS',
          data: {
            assignment_id: result.rows[0].assignment_id,
            analyze_id,
            analyze_name: analyzeName,
            scheduled_date: due_date,
            assigned_to_team: true, // Указываем, что назначено команде
          },
        });
    
        console.log(`Уведомление отправлено студенту ${member.student_id}`);
      }
    }
    
    

    res.status(201).json({
      message: "Analysis assigned successfully.",
      assignment_id: result.rows[0].assignment_id,
    });

  } catch (error) {
    console.error("Ошибка назначения анализа:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM analyzes');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка получения анализов:', error.message);
    res.status(500).json({ message: 'Ошибка получения анализов' });
  }
});


router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    // Расшифровываем токен и получаем student_id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student_id = decoded.id;

    if (!student_id) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Получаем все анализы, назначенные индивидуально студенту
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

    // Получаем все анализы, назначенные для команды, в которой состоит студент
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

    // Объединяем результаты
    const allAnalyses = [...userAnalyses.rows, ...teamAnalyses.rows];

    // Проверяем, есть ли результаты для каждого назначения
    const analysesWithStatus = await Promise.all(
      allAnalyses.map(async (analysis) => {
        const { assignment_id, analysis_table } = analysis;

        if (!analysis_table) {
          return { ...analysis, is_submitted: false }; // Если таблица не определена
        }

        const resultCheckQuery = `
          SELECT 1 FROM ${analysis_table} WHERE assignment_id = $1 AND student_id = $2
        `;
        const resultCheck = await db.query(resultCheckQuery, [assignment_id, student_id]);

        return {
          ...analysis,
          is_submitted: resultCheck.rowCount > 0, // true, если результат есть
        };
      })
    );

    res.status(200).json({ analyses: analysesWithStatus });
  } catch (error) {
    console.error("Ошибка получения анализов пользователя:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



router.post("/submit", async (req, res) => {
  const { assignment_id, analyze_data } = req.body;

  console.log(assignment_id, analyze_data);

  if (!assignment_id || !analyze_data) {
    return res
      .status(400)
      .json({ message: "Assignment ID and analyze data are required." });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken);
    const student_id = decodedToken.id;

    console.log(student_id);

    const assignmentCheck = await db.query(
      "SELECT * FROM analyze_assignments WHERE assignment_id = $1",
      [assignment_id]
    );

    if (assignmentCheck.rowCount === 0) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const assignment = assignmentCheck.rows[0];
    const analyzeId = assignment.analyze_id;

    const analyzeTypeQuery = await db.query(
      "SELECT analyze_name FROM analyzes WHERE analyze_id = $1",
      [analyzeId]
    );

    if (analyzeTypeQuery.rowCount === 0) {
      return res.status(404).json({ message: "Analyze type not found." });
    }

    const analyzeName = analyzeTypeQuery.rows[0].analyze_name;
    let targetTable;

    switch (analyzeName) {
      case "Антропометрия и биоимпедансометрия":
        targetTable = "anthropometry_bioimpedance";
        break;
      case "Клинический анализ крови":
        targetTable = "blood_clinical_analysis";
        break;
      case "Клинический анализ мочи":
        targetTable = "urine_clinical_analysis";
        break;
      case "Тонометрия":
        targetTable = "tonometry";
        break;
      case "Ритмокардиография":
        targetTable = "rhythmocardiography";
        break;
      case "Частометрия":
        targetTable = "frequencymetry";
        break;
      case "Скоростно-силовые и силовые качества":
        targetTable = "speed_strength_qualities";
        break;
      case "Хронорефлексометрия":
        targetTable = "chronoreflectometry";
        break;
      case "Стабилометрия":
        targetTable = "stabilometry";
        break;
      case "Проба с приседаниями":
        targetTable = "squat_test";
        break;
      case "Эргометрические тесты":
        targetTable = "ergometric_tests";
        break;
      case "Ортостатическая проба":
        targetTable = "orthostatic_test";
        break;
      case "Специальные функциональные пробы":
        targetTable = "special_functional_tests";
        break;
      default:
        return res.status(400).json({ message: "Unsupported analyze type." });
    }

    // Маппинг русских полей в английские
    const fieldMapping = {
      Гемоглобин: "hemoglobin",
      Глюкоза: "glucose",
      Холестерин: "cholesterol",

      Белок: "protein",
      Лейкоциты: "leukocytes",
      Эритроциты: "erythrocytes",
      // Anthropometry and bioimpedance
      "Рост": "height",
      "Вес": "weight",
      "Обхват талии": "waist_circumference",
      "Обхват бедер": "hip_circumference",
      "ИМТ": "imt",
      "АКМ": "akm",
      "ДАКМ": "dakm",
      "ЖМ": "jkm",
      "ДЖМ": "djkm",
      "СКМ": "skm",
      "ДСКМ": "dskm",
      "ОО": "oo",
      "ОЖ": "ozh",
      "ВЖ": "vzh",
      "ФУ": "fu",
    
      // Tonometry
      "АДс": "ads",
      "АДд": "add",
    
      // Rhythmocardiography
      "ЧСС": "chss",
      "RMSSD": "rmssd",
      "CV": "cv",
      "TP": "tp",
      "HF": "hf",
      "LF": "lf",
      "VLF": "vlf",
      "СФ": "sf",
      "SI": "si",
      "Тип вегетативной регуляции": "vegetative_regulation",
    
      // Frequencymetry
      "КЧССМ": "kchs",
      "Максимальная частота движений": "max_movement_frequency",
    
      // Speed-strength qualities
      "Кистевая динамометрия (сила)": "hand_dynamometry_strength",
      "Кистевая динамометрия (выносливость)": "hand_dynamometry_endurance",
      "Высота прыжка из приседа (SJ)": "sj_jump_height",
      "Высота прыжка вверх без взмаха руками": "jump_height_no_hands",
      "Высота прыжка вверх со взмахом руками": "jump_height_with_hands",
      "CMJ/SJ": "cmj_sj_ratio",
      "Мощность прыжка": "jump_power",
    
      // Stabilometry
      "Проба Ромберга": "romberg_test",
      "S (о)": "s_o",
      "V (о)": "v_o",
      "S (з)": "s_z",
      "V (з)": "v_z",
      "P (о)": "p_o",
      "P3": "p_z",
      "Кэ": "ke",
      "Динамическая проба": "dynamic_test",
      "Стресс-проба": "stress_test",
    
      // Chronoreflectometry
      "ПЗМР": "pzmr",
      "СДР": "sdr",
      "РДО": "rdo",

          // New mappings for Squat Test
      "ЧСС покоя": "chss_resting",
      "Скорость восстановления ЧСС": "chss_recovery_speed",
      "Приковая ЧСС": "chss_peak",
      "Показатели ВСР": "vsr_indicators",

      // New mappings for Ergometric Tests
      "Общий объём работы": "total_work_volume",
      ЧСС: "chss",
      "Пиковое ЧСС": "peak_chss",
      "ЧССАэП": "chss_aep",
      "ЧССАнП": "chss_anp",
      VO2: "vo2",
      VO2max: "vo2_max",
      "VO2АэП": "vo2_aep",
      "VO2АнП": "vo2_anp",
      "Мощность/скорость АэП": "power_speed_aep",
      "Мощность/скорость АнП": "power_speed_anp",
      La: "la",
      ЛВ: "lv",
      ДК: "dk",

      // New mappings for Orthostatic Test
      "ЧСС (ортостатическая проба)": "chss",
      "АДс": "ads",
      "АДд": "add",

      // New mappings for Special Functional Tests
      "ЧСС (контрольные поединки)": "chss",
      La: "la",
    };
    

    const mappedData = {};
    for (const [key, value] of Object.entries(analyze_data)) {
      if (fieldMapping[key]) {
        mappedData[fieldMapping[key]] = value;
      }
    }

    if (Object.keys(mappedData).length === 0) {
      return res.status(400).json({ message: "No valid analyze data provided." });
    }

    const result = await db.query(
      `INSERT INTO ${targetTable} (assignment_id, student_id, analyze_id, ${Object.keys(mappedData).join(
        ", "
      )}, analyze_date, created_at)
       VALUES ($1, $2, $3, ${Object.values(mappedData)
         .map((_, i) => `$${i + 4}`)
         .join(", ")}, CURRENT_DATE, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assignment_id, student_id, analyzeId, ...Object.values(mappedData)]
    );

    res.status(201).json({
      message: "Analysis submitted successfully.",
      result: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка отправки анализа:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Маршрут для получения деталей анализа
router.post("/details", async (req, res) => {
  const { assignment_id, analyze_name } = req.body;

  if (!assignment_id || !analyze_name) {
    return res
      .status(400)
      .json({ message: "assignment_id и analyze_name обязательны" });
  }

  // Логика определения таблицы по имени анализа
  let targetTable;
  switch (analyze_name) {
    case "Антропометрия и биоимпедансометрия":
      targetTable = "anthropometry_bioimpedance";
      break;
    case "Клинический анализ крови":
      targetTable = "blood_clinical_analysis";
      break;
    case "Клинический анализ мочи":
      targetTable = "urine_clinical_analysis";
      break;
    case "Тонометрия":
      targetTable = "tonometry";
      break;
    case "Ритмокардиография":
      targetTable = "rhythmocardiography";
      break;
    case "Частометрия":
      targetTable = "frequencymetry";
      break;
    case "Скоростно-силовые и силовые качества":
      targetTable = "speed_strength_qualities";
      break;
    case "Хронорефлексометрия":
      targetTable = "chronoreflectometry";
      break;
    case "Стабилометрия":
      targetTable = "stabilometry";
      break;
    case "Проба с приседаниями":
      targetTable = "squat_test";
      break;
    case "Эргометрические тесты":
      targetTable = "ergometric_tests";
      break;
    case "Ортостатическая проба":
      targetTable = "orthostatic_test";
      break;
    case "Специальные функциональные пробы":
      targetTable = "special_functional_tests";
      break;
    default:
      return res.status(400).json({ message: "Unsupported analyze type." });
  }

  /*try {
    // Поиск результатов анализа в соответствующей таблице
    const query = `
      SELECT *
      FROM ${targetTable}
      WHERE assignment_id = $1
    `;
    const result = await db.query(query, [assignment_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Результаты анализа не найдены" });
    }

    // Возврат результата
    res.json({ results: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }*/

    try {
      // Получаем список всех столбцов таблицы targetTable
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
      `;
      const columnsResult = await db.query(columnsQuery, [targetTable]);
      const allColumns = columnsResult.rows.map((row) => row.column_name);
  
      // Исключаем ненужные столбцы
      const excludedColumns = ["created_at","result_id", "assignment_id", "student_id", "analyze_id", "analyze_date"];
      const selectedColumns = allColumns.filter((col) => !excludedColumns.includes(col)).join(", ");
  
      if (!selectedColumns) {
        return res.status(400).json({ message: "No valid columns to select." });
      }
  
      // Выполняем запрос, используя оставшиеся столбцы
      const resultsQuery = `
        SELECT ${selectedColumns}
        FROM ${targetTable}
        WHERE assignment_id = $1
      `;
      const results = await db.query(resultsQuery, [assignment_id]);
  
      if (results.rows.length === 0) {
        return res.status(404).json({ message: "No data found for this assignment ID." });
      }
  
      // return res.status(200).json({ results: results.rows });

      const reversedFieldMapping = Object.fromEntries(
        Object.entries(fieldMapping).map(([key, value]) => [value, key])
      );
  
      const translatedResults = results.rows.map((row) => {
        const translatedRow = {};
        for (const key in row) {
          // Переводим ключ, если он есть в словаре
          const translatedKey = reversedFieldMapping[key] || key;
          translatedRow[translatedKey] = row[key];
        }
        return translatedRow;
      });
  
      return res.status(200).json({ results: translatedResults });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
});


// Словарь допустимых таблиц
const validTables = new Set([
  "anthropometry_bioimpedance",
  "blood_clinical_analysis",
  "urine_clinical_analysis",
  "tonometry",
  "rhythmocardiography",
  "frequencymetry",
  "speed_strength_qualities",
  "chronoreflectometry",
  "stabilometry",
  "squat_test",
  "ergometric_tests",
  "orthostatic_test",
  "special_functional_tests",
]);

function translateFields(data) {
  return data.map((row) => {
    const translatedRow = {};
    for (const [key, value] of Object.entries(row)) {
      translatedRow[fieldMapping[key] || key] = value; // Переводим ключ или оставляем как есть
    }
    return translatedRow;
  });
}

// Роут для получения данных из указанной таблицы
router.get("/:tableName", async (req, res) => {
  const { tableName } = req.params;

  // Проверяем, есть ли таблица в списке допустимых
  if (!validTables.has(tableName)) {
    return res.status(400).json({
      message: "Указанная таблица недопустима или отсутствует.",
    });
  }

 /* try {
    // Выполняем запрос к таблице
    const query = `SELECT * FROM ${tableName}`;
    const result = await db.query(query);

    // Возвращаем данные
    res.status(200).json(result.rows);
  }*/
 
    try {
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        AND column_name NOT IN ('result_id', 'assignment_id', 'student_id', 'analyze_id', 'created_at')
      `;
      const columnsResult = await db.query(columnsQuery);
  
      const columns = columnsResult.rows
      .map((row) => {
        if (row.column_name === "analyze_date") {
          // Форматируем дату для конкретного поля
          return `TO_CHAR(${row.column_name}, 'DD.MM.YYYY') AS analyze_date`;
        }
        return row.column_name;
      })
      .join(", ");
  
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

      const reversedFieldMapping = Object.fromEntries(
        Object.entries(fieldMapping).map(([key, value]) => [value, key])
      );
  
      const translatedResults = results.rows.map((row) => {
        const translatedRow = {};
        for (const key in row) {
          // Переводим ключ, если он есть в словаре
          const translatedKey = reversedFieldMapping[key] || key;
          translatedRow[translatedKey] = row[key];
        }
        return translatedRow;
      });

      res.json(translatedResults);
    } catch (error) {
    console.error("Ошибка при запросе к таблице:", error);
    res.status(500).json({
      message: "Ошибка сервера при получении данных из таблицы.",
    });
  }
});

module.exports = router;
