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

const mailOptions = {
  from: 'cfuv.analyses@yandex.ru',
  to: 'imaginepeach@mail.ru',
  subject: 'Hello World!',
  html: `
    <h1>Hello?</h1>
    <p>How are you?</p>
  `
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