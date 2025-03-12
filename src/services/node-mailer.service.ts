import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: Number(587), // Assuming MAIL_PORT is a string, convert it to a number
    auth: {
      user: "akshay.scrobits@gmail.com",
      pass: "ztqz rqaw qrsr binl",
    },
});

  const sendMail = async (client:string) =>{
    const info = await transporter.sendMail({
      from: '"Scrobits" <scrobits@scrobits.com>',
      to:   `${client}`, 
      subject: "Hello ✔", 
      text: "Hello world?", 
      html: "<b>Hello world?</b>", 
    });
  }

export default sendMail;
