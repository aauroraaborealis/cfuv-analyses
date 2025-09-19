import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Анализы КФУ <onboarding@resend.dev>', 
      to: to,
      subject: subject,
      html: html
    });

    if (error) {
      console.error('Ошибка отправки email:', error);
      throw error;
    }

    console.log('Email отправлен:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}