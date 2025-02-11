import { Router, Request, Response } from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/register-students', async (req: Request, res: Response) => {
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
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !birth_date ||
    !gender ||
    !sport_id
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const sportCheck = await db.query(
      'SELECT sport_id FROM sports WHERE sport_id = $1',
      [sport_id]
    );
    if (sportCheck.rowCount === 0) {
      return res.status(400).json({ message: 'Sport does not exist.' });
    }

    if (team_id) {
      const teamCheck = await db.query(
        'SELECT team_id FROM teams WHERE team_id = $1',
        [team_id]
      );
      if (teamCheck.rowCount === 0) {
        return res.status(400).json({ message: 'Team does not exist.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.student_id,
        email: user.email,
        name: user.first_name,
        role: "student"
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(token);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

router.post("/register-trainers", async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, middle_name, gender } = req.body;

    if (!email || !password || !first_name || !last_name || !gender) {
      return res.status(400).json({ message: "Все поля обязательны." });
    }

    // 🔎 Проверяем, есть ли такой email среди тренеров
    const trainerCheck = await db.query(
      "SELECT trainer_id FROM trainers WHERE email = $1",
      [email]
    );

    // 🔎 Проверяем, есть ли такой email среди студентов
    const studentCheck = await db.query(
      "SELECT student_id FROM students WHERE email = $1",
      [email]
    );

    if ((trainerCheck.rowCount ?? 0) > 0 || (studentCheck.rowCount ?? 0) > 0) {
      return res.status(409).json({ message: "Email уже используется." });
    }

    // 🔒 Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Регистрируем тренера
    const queryText = `
      INSERT INTO trainers (email, password_hash, first_name, last_name, middle_name, gender)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING trainer_id, email, first_name;
    `;
    const values = [email, hashedPassword, first_name, last_name, middle_name || null, gender];

    const result = await db.query(queryText, values);
    const trainer = result.rows[0];

    // 🔑 Генерируем JWT-токен
    const token = jwt.sign(
      {
        id: trainer.trainer_id,
        email: trainer.email,
        name: trainer.first_name,
        role: "trainer",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Тренер зарегистрирован!",
      token,
    });
  } catch (error: any) {
    console.error("Ошибка регистрации тренера:", error);
    res.status(500).json({ message: "Ошибка регистрации тренера", error });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны." });
  }

  try {
    // 🔍 Проверяем среди студентов
    let userQuery = `
      SELECT student_id AS id, email, first_name, password_hash, 'student' AS role 
      FROM students WHERE email = $1
    `;
    let userResult = await db.query(userQuery, [email]);

    // 🔍 Если не найден среди студентов, проверяем среди тренеров
    if (userResult.rowCount === 0) {
      userQuery = `
        SELECT trainer_id AS id, email, first_name, password_hash, 'trainer' AS role 
        FROM trainers WHERE email = $1
      `;
      userResult = await db.query(userQuery, [email]);

      if (userResult.rowCount === 0) {
        return res.status(404).json({ message: "Пользователь не найден." });
      }
    }

    const user = userResult.rows[0];

    // 🔒 Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Неверный email или пароль." });
    }

    // 🔑 Генерируем JWT-токен с указанием роли
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.first_name,
        role: user.role, // "student" или "trainer"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Успешный вход.", token });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});


export default router;
