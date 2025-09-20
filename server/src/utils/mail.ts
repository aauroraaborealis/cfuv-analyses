import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  FROM_NAME,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
  console.warn('[email] Missing SMTP env vars');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 465),
  secure: String(SMTP_SECURE ?? 'true').toLowerCase() === 'true', 
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `${FROM_NAME || 'Mailer'} <${FROM_EMAIL}>`,
      to,
      subject,
      text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      html,
    });

    console.log('Email sent:', info.messageId);
    return { id: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}