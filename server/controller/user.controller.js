const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
  async createUser(req, res) {
    const {
      name,
      surname,
      middlename,
      email,
      birth_date,
      password,
      sport_id,   // ID вида спорта из таблицы sports
      team_name,  // Название команды, если командный спорт
    } = req.body;
  
    const client = await db.connect(); // Подключаем клиент для транзакции
  
    try {
      await client.query('BEGIN'); // Начинаем транзакцию
  
      // Хэшируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Создаём пользователя
      const newUser = await client.query(
        `INSERT INTO users (name, surname, middlename, email, birth_date, password) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, name, surname`,
        [name, surname, middlename, email, birth_date, hashedPassword]
      );
  
      const userId = newUser.rows[0].id;
  
      // Если передан sport_id, добавляем запись в user_sports
      if (sport_id) {
        await client.query(
          `INSERT INTO user_sports (user_id, sport_id, team_name)
           VALUES ($1, $2, $3)`,
          [userId, sport_id, team_name || null]
        );
      }
  
      await client.query('COMMIT');
  
      res.json({
        message: 'Регистрация успешна',
        user: newUser.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK'); 
      res.status(500).json({ error: err.message });
    } finally {
      client.release(); 
    }
  }
  

  async loginUser(req, res) {
    const { email, password } = req.body;
    try {
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'your_secret_key',
        { expiresIn: '1h' }
      );

      res.json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsers(req, res) {
    const users = await db.query(`SELECT * FROM users`);
    res.json(users.rows);
  }

  async getOneUser(req, res) {
    const id = req.params.id;
    const user = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    res.json(user.rows[0]);
  }

  async updateUser(req, res) {
    const { id, name, surname, middlename, email, birth_date, password } =
      req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await db.query(
      `UPDATE users 
             SET name = $1, surname = $2, middlename = $3, email = $4, birth_date = $5, password = COALESCE($6, password) 
             WHERE id = $7 
             RETURNING *`,
      [name, surname, middlename, email, birth_date, hashedPassword, id]
    );
    res.json(user.rows[0]);
  }

  async deleteUser(req, res) {
    const id = req.params.id;
    const user = await db.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [
      id,
    ]);
    res.json(user.rows[0]);
  }
}

module.exports = new UserController();
