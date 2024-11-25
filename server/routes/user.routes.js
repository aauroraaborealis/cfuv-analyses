const Router = require('express');
const router = new Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Для создания токена

// Секретный ключ для токена
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

router.post('/register', async (req, res) => {
  const { first_name, middle_name, last_name, email, password, birth_date, gender, sport_id, in_team, team_id } = req.body;

  console.log(first_name, middle_name, last_name, email, password, birth_date, gender, sport_id, in_team, team_id);

  if (!first_name || !last_name || !email || !password || !birth_date || !gender || !sport_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Проверяем, существует ли вид спорта
    const sportCheck = await db.query('SELECT sport_id FROM sports WHERE sport_id = $1', [sport_id]);
    if (sportCheck.rowCount === 0) {
      return res.status(400).json({ message: 'Sport does not exist.' });
    }

    // Проверяем, существует ли команда
    if (team_id) {
      const teamCheck = await db.query('SELECT team_id FROM teams WHERE team_id = $1', [team_id]);
      if (teamCheck.rowCount === 0) {
        return res.status(400).json({ message: 'Team does not exist.' });
      }
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Добавляем пользователя в базу данных
    const query = `
      INSERT INTO students (student_id, first_name, middle_name, last_name, email, password_hash, birth_date, gender, sport_id, in_team, team_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING student_id, email, first_name;
    `;
    const values = [first_name, middle_name || null, last_name, email, hashedPassword, birth_date, gender, sport_id, in_team || false, team_id || null];

    const result = await db.query(query, values);

    const user = result.rows[0];

    // Создаём JWT токен
    const token = jwt.sign(
      {
        id: user.student_id,
        email: user.email,
        name: user.first_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Токен действует 7 дней
    );

    console.log(token);

    // Возвращаем ответ с токеном
    res.status(201).json({
      message: 'User registered successfully.',
      token, // Токен для аутентификации
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

module.exports = router;
