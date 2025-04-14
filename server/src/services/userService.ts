import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { VerificationService } from './verificationService.js';

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

interface User {
  id: string;
  email: string;
  first_name: string;
  role: 'student' | 'trainer';
}

interface IToken {
  accessToken: string; 
  refreshToken: string;
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
    password: string,
    role: 'student' | 'trainer'
  ): Promise<{ token: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
  
    let query = '';
    if (role === 'student') {
      query = `
        SELECT student_id AS id, email, first_name, password_hash
        FROM students WHERE email = $1
      `;
    } else if (role === 'trainer') {
      query = `
        SELECT trainer_id AS id, email, first_name, password_hash
        FROM trainers WHERE email = $1
      `;
    } else {
      throw new Error('Invalid role.');
    }
  
    const result = await db.query(query, [email]);
    if (result.rowCount === 0) {
      throw new Error('User not found.');
    }
  
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
  
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }
  
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.first_name,
        role: role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  
    return { token };
  }
  

  static async registerStudentInit(data: any): Promise<void> {
    const { email, password } = data;
  
    // Проверка: email не занят
    const emailCheck = await db.query(
      'SELECT 1 FROM students WHERE email = $1 UNION SELECT 1 FROM trainers WHERE email = $1',
      [email]
    );
    if (emailCheck.rowCount! > 0) {
      throw new Error('Email already exists.');
    }
  
    // Хэшируем пароль до сохранения payload
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const payload = {
      ...data,
      password: hashedPassword, // уже хэш
      type: 'student'
    };
  
    await VerificationService.sendCode(email, payload);
  }
  
  static async registerStudentVerify(email: string, code: string): Promise<{ token: string }> {
    const payload = await VerificationService.verifyCode(email, code);
    if (!payload || payload.type !== 'student') {
      throw new Error('Invalid or expired code.');
    }
  
    // Пароль уже хэширован на init-этапе
    const hashedPassword = payload.password;
  
    const result = await db.query(`
      INSERT INTO students (student_id, first_name, middle_name, last_name, email, password_hash, birth_date, gender, sport_id, in_team, team_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING student_id, email, first_name;
    `, [
      payload.first_name,
      payload.middle_name || null,
      payload.last_name,
      payload.email,
      hashedPassword,
      payload.birth_date,
      payload.gender,
      payload.sport_id,
      payload.in_team || false,
      payload.team_id || null
    ]);
  
    await VerificationService.delete(email);
  
    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.student_id,
        email: user.email,
        first_name: user.first_name,
        role: 'student'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  
    return { token };
  }
  
  static async registerTrainerInit(data: any): Promise<void> {
    const { email, password } = data;
  
    const emailCheck = await db.query(
      'SELECT 1 FROM students WHERE email = $1 UNION SELECT 1 FROM trainers WHERE email = $1',
      [email]
    );
    if (emailCheck.rowCount! > 0) {
      throw new Error('Email already exists.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const payload = {
      ...data,
      password: hashedPassword,
      type: 'trainer'
    };
  
    await VerificationService.sendCode(email, payload);
  }
  
  
  static async registerTrainerVerify(email: string, code: string): Promise<{ token: string }> {
    const payload = await VerificationService.verifyCode(email, code);
    if (!payload || payload.type !== 'trainer') {
      throw new Error('Invalid or expired code.');
    }
  
    const hashedPassword = payload.password;
  
    const result = await db.query(`
      INSERT INTO trainers (trainer_id, email, password_hash, first_name, last_name, middle_name, gender)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
      RETURNING trainer_id, email, first_name;
    `, [
      payload.email,
      hashedPassword,
      payload.first_name,
      payload.last_name,
      payload.middle_name || null,
      payload.gender
    ]);
  
    await VerificationService.delete(email);
  
    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.trainer_id,
        email: user.email,
        first_name: user.first_name,
        role: 'trainer',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  
    return { token };
  }
  

  static async registerInit(role: 'student' | 'trainer', data: any): Promise<void> {
    const { email, password } = data;
  
    const emailCheck = await db.query(
      'SELECT 1 FROM students WHERE email = $1 UNION SELECT 1 FROM trainers WHERE email = $1',
      [email]
    );
    if (emailCheck.rowCount! > 0) {
      throw new Error('Email already exists.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const payload = {
      ...data,
      password: hashedPassword,
      role
    };
  
    await VerificationService.sendCode(email, payload);
  }

  static async registerVerify(role: 'student' | 'trainer', email: string, code: string): Promise<IToken> {
    const payload = await VerificationService.verifyCode(email, code);
    if (!payload || payload.role !== role) {
      throw new Error('Invalid or expired code.');
    }
  
    const hashedPassword = payload.password;
  
    let query: string;
    let values: any[];
    let idField: string;
  
    if (role === 'student') {
      query = `
        INSERT INTO students (student_id, first_name, middle_name, last_name, email, password_hash, birth_date, gender, sport_id, in_team, team_id)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING student_id, email, first_name;
      `;
      values = [
        payload.first_name,
        payload.middle_name || null,
        payload.last_name,
        payload.email,
        hashedPassword,
        payload.birth_date,
        payload.gender,
        payload.sport_id,
        payload.in_team || false,
        payload.team_id || null
      ];
      idField = 'student_id';
    } else {
      query = `
        INSERT INTO trainers (trainer_id, email, password_hash, first_name, last_name, middle_name, gender)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
        RETURNING trainer_id, email, first_name;
      `;
      values = [
        payload.email,
        hashedPassword,
        payload.first_name,
        payload.last_name,
        payload.middle_name || null,
        payload.gender
      ];
      idField = 'trainer_id';
    }
  
    const result = await db.query(query, values);
    await VerificationService.delete(email);
  
    const user = result.rows[0];
    return generateTokens({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      role: user.role
    });
    
  } 

  static async loginInit(email: string, password: string): Promise<void> {
    // Пробуем найти студента
    let query = `
      SELECT student_id AS id, email, first_name, password_hash, 'student' AS role
      FROM students WHERE email = $1
    `;
    let result = await db.query(query, [email]);
  
    if (result.rowCount === 0) {
      // Пробуем тренера
      query = `
        SELECT trainer_id AS id, email, first_name, password_hash, 'trainer' AS role
        FROM trainers WHERE email = $1
      `;
      result = await db.query(query, [email]);
  
      if (result.rowCount === 0) {
        throw new Error('User not found.');
      }
    }
  
    const user = result.rows[0];
  
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }
  
    // Сохраняем только нужные поля
    const payload = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      role: user.role
    };
  
    await VerificationService.sendCode(email, payload);
  }
  
  static async loginVerify(email: string, code: string):  Promise<IToken> {
    console.log('login');
    const payload = await VerificationService.verifyCode(email, code);
    console.log(payload);
    if (!payload || !payload.role || !payload.id) {
      throw new Error('Invalid or expired code.');
    }
    console.log(payload);
  
    await VerificationService.delete(email);

    console.log({
      id: payload.id,
      email: payload.email,
      first_name: payload.first_name,
      role: payload.role
    })

    return generateTokens({
      id: payload.id,
      email: payload.email,
      first_name: payload.first_name,
      role: payload.role
    });
    

  }

  static async refreshToken(oldRefreshToken: string): Promise<{ accessToken: string }> {
    if (!oldRefreshToken) {
      throw new Error('Refresh token required.');
    }
  
    try {
      const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET) as any;
  
      // можно дополнительно проверить в БД, IP, UA и т.п.
      const accessToken = jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          first_name: payload.first_name,
          role: payload.role,
        },
        ACCESS_SECRET,
        { expiresIn: '15m' }
      );
  
      return { accessToken };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }
  
  
  
}
