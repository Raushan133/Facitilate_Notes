const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

class Mail {
  constructor() {
    this.mailOptions = {
      from: {
        address: process.env.EMAIL,
        name: "Roshan Kumar Singh",
      },
      to: [],
      cc: [],
      bcc: [],
      attachments: [],
    };
  }

  setCompanyName(name) {
    if (!this.mailOptions.from) {
      this.mailOptions.from = {}; // ✅ Ensure `from` exists
    }
    this.mailOptions.from.name = name;
  }

  setSenderEmail(email) {
    this.mailOptions.from.address = email;
  }

  setTo(receiver) {
    if (Array.isArray(receiver)) {
      this.mailOptions.to.push(...receiver);
    } else {
      this.mailOptions.to.push(receiver);
    }
  }

  setCC(CC) {
    if (Array.isArray(CC)) {
      this.mailOptions.cc.push(...CC);
    } else {
      this.mailOptions.cc.push(CC);
    }
  }

  setBCC(BCC) {
    if (Array.isArray(BCC)) {
      this.mailOptions.bcc.push(...BCC);
    } else {
      this.mailOptions.bcc.push(BCC);
    }
  }

  setAttachments(attachment) {
    if (Array.isArray(adjustement)) {
      this.mailOptions.attachments.push(...attachment);
    } else {
      this.mailOptions.attachments.push(attachment);
    }
  }

  setSubject(subject) {
    this.mailOptions.subject = subject;
  }

  setText(text) {
    this.mailOptions.text = text;
  }

  sethtml(html) {
    this.mailOptions.html = html;
  }

  send() {
    return new Promise((resolve, reject) => {
      transporter.sendMail(this.mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}

module.exports = Mail;
