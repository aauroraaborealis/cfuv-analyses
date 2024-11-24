const express = require('express');
const router = express.Router();
const db = require('../db');

// Получение списка видов спорта
router.post('/sports', async (req, res) => {
  const { name, is_team_sport } = req.body;

  try {
    if (!name || typeof is_team_sport !== 'boolean') {
      throw new Error('Invalid input data: name must be a string and is_team_sport must be a boolean.');
    }

    const trimmedName = name.trim();
    const capitalizedName =
      trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

    console.log('Adding sport:', capitalizedName, is_team_sport); // Для отладки

    const result = await db.query(
      'INSERT INTO sports (name, is_team_sport) VALUES ($1, $2) RETURNING *',
      [capitalizedName, is_team_sport]
    );

    console.log('Sport added:', result.rows[0]); // Успешный запрос
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /sports:', err.message); // Логируем точную ошибку
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
});

router.get('/sports', async (req, res) => {
  try {
    console.log('Fetching sports list...'); // Для отладки

    const result = await db.query('SELECT * FROM sports ORDER BY name');

    console.log('Sports fetched:', result.rows); // Для отладки
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /sports:', err.message); // Логируем ошибку
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
});

module.exports = router;
