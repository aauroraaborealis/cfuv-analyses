const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/analyses", async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM analyses ORDER BY name");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching analyses:", err.message);
      res.status(500).json({ error: err.message || "Unknown server error" });
    }
  });

// Назначение анализа команде
// router.post("/assign-analysis", async (req, res) => {
//     const { analysis_id, sport_id, team_id, assigned_date, due_date } = req.body;
  
//     // Проверка, что все обязательные данные переданы
//     if (!analysis_id || !sport_id || !team_id || !assigned_date) {
//       return res.status(400).json({
//         error: "analysis_id, sport_id, team_id, and assigned_date are required.",
//       });
//     }
  
//     try {
//       const result = await db.query(
//         `INSERT INTO assigned_analyses (analysis_id, sport_id, team_id, assigned_date, due_date) 
//          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//         [analysis_id, sport_id, team_id, assigned_date, due_date || null]
//       );
  
//       res.json(result.rows[0]);
//     } catch (err) {
//       console.error("Error assigning analysis:", err.message);
//       res.status(500).json({ error: err.message || "Unknown server error" });
//     }
//   });

router.post("/assign-analysis", async (req, res) => {
    const { analysis_id, sport_id, team_id, due_date } = req.body;
  
    if (!analysis_id || !sport_id || !team_id || !due_date) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      // Получаем текущую дату
      const assigned_date = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
  
      const result = await db.query(
        `
        INSERT INTO assigned_analyses (analysis_id, sport_id, team_id, assigned_date, due_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [analysis_id, sport_id, team_id, assigned_date, due_date]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error in assigning analysis:", err.message);
      res.status(500).json({ error: err.message || "Unknown server error" });
    }
  });
  

module.exports = router;
