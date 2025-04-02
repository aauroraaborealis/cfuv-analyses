import nodemailer from 'nodemailer'
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'yandex',
  auth: {
    user: 'cfuv.analyses',
    pass: process.env.MAIL_PASS
  }
})

const t = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Назначение анализа</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f1f1f1;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            background-color: #28a745;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="header">
        Анализы КФУ
    </div>
    <div class="content">
        <p>Здравствуйте,</p>
        <p>Вам назначен анализ <strong>Стабилометрия</strong> на <strong>12.02.2025</strong>.</p>
    </div>
</body>
</html>
`; 

const mailOptions = {
  from: 'cfuv.analyses@yandex.ru',
  to: 'imaginepeach@mail.ru',
  subject: 'Назначение нового анализа',
  html: `${t}`
}

const send = () => {
  return new Promise((resolve, reject) => { 
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error)
      }
      resolve(info)
    })
  })
}

await send()


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