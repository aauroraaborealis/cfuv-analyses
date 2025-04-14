import db from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { VerificationService } from './verificationService';

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

interface IToken {
  accessToken: string;
  refreshToken: string;
}

export class userService {

  static async registerInit(
    role: 'student' | 'trainer',
    data: any
  ): Promise<void> {
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
      role,
    };

    await VerificationService.sendCode(email, payload);
  }

  static async registerVerify(
    role: 'student' | 'trainer',
    email: string,
    code: string
  ): Promise<IToken> {
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
        payload.team_id || null,
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
        payload.gender,
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
      role: user.role,
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
      role: user.role,
    };

    await VerificationService.sendCode(email, payload);
  }

  static async loginVerify(email: string, code: string): Promise<IToken> {
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
      role: payload.role,
    });

    return generateTokens({
      id: payload.id,
      email: payload.email,
      first_name: payload.first_name,
      role: payload.role,
    });
  }

  static async refreshToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string }> {
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
