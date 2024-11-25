const Router = require('express');
const router = new Router();
const db = require('../db'); // Подключение к базе данных

// Маршрут для создания нового вида спорта
router.post('/create', async (req, res) => {
  const { sport_name } = req.body;

  // Проверка обязательного поля
  if (!sport_name) {
    return res.status(400).json({ message: 'Sport name is required.' });
  }

  try {
    // Проверка на уникальность названия вида спорта
    const sportCheck = await db.query('SELECT sport_id FROM sports WHERE sport_name = $1', [sport_name]);
    if (sportCheck.rowCount > 0) {
      return res.status(409).json({ message: 'Sport already exists.' });
    }

    // Вставка нового вида спорта
    const query = `
      INSERT INTO sports (sport_id, sport_name)
      VALUES (uuid_generate_v4(), $1)
      RETURNING sport_id;
    `;
    const result = await db.query(query, [sport_name]);

    res.status(201).json({
      message: 'Sport created successfully.',
      sport_id: result.rows[0].sport_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the sport.' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const result = await db.query('SELECT sport_id, sport_name FROM sports');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching sports.' });
  }
});


module.exports = router;
