const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
  const { first_name, last_name, email, password, birth_date, gender, sport, in_team, team_id } = req.body;

  // Проверка обязательных полей
  if (!first_name || !last_name || !email || !password || !birth_date || !gender || !sport) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка данных в таблицу students
    const query = `
      INSERT INTO students (first_name, last_name, email, password_hash, birth_date, gender, sport, in_team, team_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING student_id;
    `;
    const values = [first_name, last_name, email, hashedPassword, birth_date, gender, sport, in_team || false, team_id || null];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'User registered successfully.',
      student_id: result.rows[0].student_id,
    });
  } catch (error) {
    if (error.code === '23505') {
      // Код ошибки 23505 означает дублирующее значение уникального поля
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
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
        { expiresIn: '72h' }
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
