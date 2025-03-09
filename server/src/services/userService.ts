import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface User {
  id: string;
  email: string;
  first_name: string;
  role: 'student' | 'trainer';
}

export class userService {
  static async registerStudent(data: any): Promise<{ token: string }> {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      birth_date,
      gender,
      sport_id,
      in_team,
      team_id,
    } = data;

    // Проверяем наличие всех обязательных полей
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !birth_date ||
      !gender ||
      !sport_id
    ) {
      throw new Error('All fields are required.');
    }

    // Проверяем существование спорта
    const sportCheck = await db.query(
      'SELECT sport_id FROM sports WHERE sport_id = $1',
      [sport_id]
    );
    if (sportCheck.rowCount === 0) {
      throw new Error('Sport does not exist.');
    }

    // Проверяем существование команды (если передана)
    if (team_id) {
      const teamCheck = await db.query(
        'SELECT team_id FROM teams WHERE team_id = $1',
        [team_id]
      );
      if (teamCheck.rowCount === 0) {
        throw new Error('Team does not exist.');
      }
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Добавляем студента
    const queryText = `
      INSERT INTO students (student_id, first_name, middle_name, last_name, email, password_hash, birth_date, gender, sport_id, in_team, team_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING student_id, email, first_name;
    `;
    const values = [
      first_name,
      middle_name || null,
      last_name,
      email,
      hashedPassword,
      birth_date,
      gender,
      sport_id,
      in_team || false,
      team_id || null,
    ];
    const result = await db.query(queryText, values);

    const user: User = {
      id: result.rows[0].student_id,
      email: result.rows[0].email,
      first_name: result.rows[0].first_name,
      role: 'student',
    };

    // Генерируем токен
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    return { token };
  }

  static async registerTrainer(data: any): Promise<{ token: string }> {
    const { email, password, first_name, last_name, middle_name, gender } =
      data;

    if (!email || !password || !first_name || !last_name || !gender) {
      throw new Error('All fields are required.');
    }

    // Проверяем, используется ли email
    const emailCheck = await db.query(
      'SELECT 1 FROM trainers WHERE email = $1 UNION SELECT 1 FROM students WHERE email = $1',
      [email]
    );

    if (emailCheck && emailCheck.rowCount !== null && emailCheck.rowCount > 0) {
      throw new Error('Email already exists.');
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Добавляем тренера
    const queryText = `
      INSERT INTO trainers (trainer_id, email, password_hash, first_name, last_name, middle_name, gender)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
      RETURNING trainer_id, email, first_name;
    `;
    const values = [
      email,
      hashedPassword,
      first_name,
      last_name,
      middle_name || null,
      gender,
    ];
    const result = await db.query(queryText, values);

    const trainer: User = {
      id: result.rows[0].trainer_id,
      email: result.rows[0].email,
      first_name: result.rows[0].first_name,
      role: 'trainer',
    };

    // Генерируем токен
    const token = jwt.sign(trainer, JWT_SECRET, { expiresIn: '7d' });

    return { token };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    // Проверяем среди студентов
    let userQuery = `
      SELECT student_id AS id, email, first_name, password_hash, 'student' AS role 
      FROM students WHERE email = $1
    `;
    let userResult = await db.query(userQuery, [email]);

    // Если не найден среди студентов, проверяем среди тренеров
    if (userResult.rowCount === 0) {
      userQuery = `
        SELECT trainer_id AS id, email, first_name, password_hash, 'trainer' AS role 
        FROM trainers WHERE email = $1
      `;
      userResult = await db.query(userQuery, [email]);

      if (userResult.rowCount === 0) {
        throw new Error('User not found.');
      }
    }

    const user = userResult.rows[0];

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid email or password.');
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.first_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token };
  }
}
