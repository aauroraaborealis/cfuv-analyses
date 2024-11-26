const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken'); // Для создания токена
require('dotenv').config();

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
    const result = await db.query('SELECT analyze_id, analyze_name FROM analyzes');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка получения анализов:', error.message);
    res.status(500).json({ message: 'Ошибка получения анализов' });
  }
});


// Роут для получения анализов пользователя
router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    // Расшифровываем токен и получаем student_id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student_id = decoded.id;

    console.log(decoded);
    console.log(student_id);



    if (!student_id) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Получаем все анализы, назначенные индивидуально студенту
    const userAnalysesQuery = `
      SELECT
        aa.assignment_id,
        a.analyze_name,
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

    console.log({ analyses: allAnalyses });

    // Отправляем объединенные данные
    res.status(200).json({ analyses: allAnalyses });
  } catch (error) {
    console.error("Ошибка получения анализов пользователя:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
