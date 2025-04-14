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

// const t = `<!DOCTYPE html>
// <html lang="ru">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Назначение анализа</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f1f1f1;
//             color: #000;
//             margin: 0;
//             padding: 0;
//         }
//         .header {
//             background-color: #28a745;
//             color: white;
//             text-align: center;
//             padding: 20px;
//             font-size: 24px;
//         }
//         .content {
//             background-color: #ffffff;
//             padding: 20px;
//             margin: 20px;
//             border-radius: 8px;
//         }
//         .content p {
//             font-size: 16px;
//             line-height: 1.6;
//         }
//     </style>
// </head>
// <body>
//     <div class="header">
//         Анализы КФУ
//     </div>
//     <div class="content">
//         <p>Здравствуйте,</p>
//         <p>Вам назначен анализ <strong>Стабилометрия</strong> на <strong>12.02.2025</strong>.</p>
//     </div>
// </body>
// </html>
// `; 

// const mailOptions = {
//   from: 'cfuv.analyses@yandex.ru',
//   to: 'imaginepeach@mail.ru',
//   subject: 'Назначение нового анализа',
//   html: `${t}`
// }

const mailOptions2 = {
  from: 'cfuv.analyses@yandex.ru',
  to: 'imaginepeach@mail.ru',
  subject: 'Ваш код для двухфакторной аутентификации',
  html: `<p>Ваш код: <strong>146635</strong>. Он действителен в течение 5 минут.</p>`
};

// await transporter.sendMail(mailOptions);

const send = () => {
  return new Promise((resolve, reject) => { 
    transporter.sendMail(mailOptions2, (error, info) => {
      if (error) {
        reject(error)
      }
      resolve(info)
    })
  })
}

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

// if (studentEmail) {
//   await sendMail({
//     to: studentEmail,
//     subject: 'Новый анализ назначен',
//     html: `
//       <h1>Здравствуйте!</h1>
//       <p>Вам назначен новый анализ: <strong>${analyzeName}</strong></p>
//       <p>Дата: ${scheduled_date}</p>
//     `,
//   });