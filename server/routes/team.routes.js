const Router = require('express');
const router = new Router();
const db = require('../db'); // Подключение к базе данных

// Маршрут для создания команды
router.post('/create', async (req, res) => {
  const { sport_id, team_name } = req.body;

  if (!sport_id || !team_name) {
    return res.status(400).json({ message: "Team name and sport are required." });
  }

  try {
    const result = await db.query(
      `INSERT INTO teams (team_id, team_name, sport_id)
       VALUES (uuid_generate_v4(), $1, $2)
       RETURNING team_id, team_name`,
      [team_name, sport_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания команды:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/list', async (req, res) => {
  const { sport_id } = req.query;

  if (!sport_id) {
    return res.status(400).json({ message: 'Sport ID is required' });
  }

  try {
    const result = await db.query(
      `SELECT team_id, team_name FROM teams WHERE sport_id = $1`,
      [sport_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Ошибка получения списка команд:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
