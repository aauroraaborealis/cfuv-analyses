import nodemailer from 'nodemailer'
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'yandex',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

const mailOptions2 = {
  from: 'cfuv.analyses@yandex.ru',
  to: 'imaginepeach@mail.ru',
  subject: 'Ваш код для двухфакторной аутентификации',
  html: `<p>Ваш код: <strong>146635</strong>. Он действителен в течение 5 минут.</p>`
};

const mailOptions3 = {
  from: 'cfuv.analyses@yandex.ru',
  to: 'imaginepeach@mail.ru',
  subject: 'Назначение нового анализа',
  html: `<p>Здравствуйте!</p>
        <p>Вам назначено исследованиe: <strong>Стабилометрия</strong>.</p>
        <p>Дата проведения: 05.03.2025</p>`
};


// const send = () => {
//   return new Promise((resolve, reject) => { 
//     transporter.sendMail(mailOptions3, (error, info) => {
//       if (error) {
//         reject(error)
//       }
//       resolve(info)
//     })
//   })
// }

// await send()

export const sendVerificationEmail = async (email: string, code: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Код подтверждения</h2>
      <p>Здравствуйте!</p>
      <p>Ваш код подтверждения: <strong style="font-size: 22px;">${code}</strong></p>
      <p>Он действителен в течение <strong>10 минут</strong>.</p>
    </div>
  `;

  const mailOptions = {
    from: 'cfuv.analyses@yandex.ru',
    to: email,
    subject: 'Код подтверждения регистрации',
    html,
  };

  await transporter.sendMail(mailOptions);
};
