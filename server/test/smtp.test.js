"use strict";
const nodemailer = require("nodemailer");
require("dotenv").config({
  path: "../../.env",
});
let count = 0;
console.time("send_mail");
// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  const options = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    pool: !!process.env.MAIL_POOL || false,
    
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      secure: !!process.env.SMTP_SECURE,
      requireTLS: true,
    },
  };

  console.log({ options });

  let transporter = nodemailer.createTransport(options);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `Hi 👻" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
    to: "aniekutmfonekere@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
console.timeLog("send_mail");


main().catch(console.error);
