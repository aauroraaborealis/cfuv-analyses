import db from '../db';
import { transporter } from '../utils/mail';

export class VerificationService {
  static async sendCode(email: string, payload: any) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await db.query(`
      INSERT INTO verification_codes (email, code, expires_at, payload)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, payload = $4;
    `, [email, code, expiresAt, JSON.stringify(payload)]);

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Код подтверждения регистрации',
      text: `Ваш код подтверждения: ${code}`
    });
  }

  static async verifyCode(email: string, inputCode: string) {
    const result = await db.query('SELECT * FROM verification_codes WHERE email = $1', [email]);
    if (result.rowCount === 0) return null;

    const { code, expires_at, payload } = result.rows[0];
    if (code !== inputCode || new Date() > new Date(expires_at)) return null;

    return payload;
  }

  static async delete(email: string) {
    await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);
  }
}
