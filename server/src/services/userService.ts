import db from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

interface IToken {
  accessToken: string;
  refreshToken: string;
}

export class userService {
  static async register(
    role: 'student' | 'trainer',
    data: any
  ): Promise<IToken> {
    const { email, password } = data;

    const emailCheck = await db.query(
      'SELECT 1 FROM students WHERE email = $1 UNION SELECT 1 FROM trainers WHERE email = $1',
      [email]
    );

    if (emailCheck.rowCount! > 0) {
      throw new Error('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
        data.first_name,
        data.middle_name || null,
        data.last_name,
        data.email,
        hashedPassword,
        data.birth_date,
        data.gender,
        data.sport_id,
        data.in_team || false,
        data.team_id || null,
      ];
      idField = 'student_id';
    } else {
      query = `
        INSERT INTO trainers (trainer_id, email, password_hash, first_name, last_name, middle_name, gender)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
        RETURNING trainer_id, email, first_name;
      `;
      values = [
        data.email,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.middle_name || null,
        data.gender,
      ];
      idField = 'trainer_id';
    }

    const result = await db.query(query, values);
    const user = result.rows[0];
    
    const tokens = generateTokens({
      id: user[idField], 
      email: user.email,
      first_name: user.first_name,
      role: role, 
    });
    
    return tokens;
  }

  static async login(email: string, password: string): Promise<IToken> {
    let query = `
      SELECT student_id AS id, email, first_name, password_hash, 'student' AS role
      FROM students WHERE email = $1
    `;
    let result = await db.query(query, [email]);

    if (result.rowCount === 0) {
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

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      role: user.role, 
    });

    return tokens;
  }

  static async refreshToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string }> {
    if (!oldRefreshToken) {
      throw new Error('Refresh token required.');
    }

    try {
      const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET) as any;

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