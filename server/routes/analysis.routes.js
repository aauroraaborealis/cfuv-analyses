const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/analyses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM analyses ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching analyses:', err.message);
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
});

router.post('/assign-analysis', async (req, res) => {
  const { analysis_id, sport_id, team_id, due_date } = req.body;

  if (!analysis_id || !sport_id || !team_id || !due_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Получаем текущую дату
    const assigned_date = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD

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
    console.error('Error in assigning analysis:', err.message);
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
});


router.get("/user-analyses", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        aa.id AS analysis_assignment_id,
        a.name AS analysis_name,
        aa.due_date,
        us.team_name,
        us.user_id AS member_user_id
      FROM 
        assigned_analyses aa
      LEFT JOIN 
        user_sports us ON aa.team_id = us.id
      LEFT JOIN 
        analyses a ON aa.analysis_id = a.id
      WHERE 
        us.user_id = $1
        OR (aa.team_id IS NOT NULL AND us.user_id = $1)
      ORDER BY aa.due_date
      `,
      [user_id]
    );

    console.log(result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка получения анализов пользователя:", err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
