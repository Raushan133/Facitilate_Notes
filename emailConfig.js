require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    // user: "rashanchapra33@gmail.com", // Replace with your email
    // pass: "snvj lufe qpnv axqo", // Replace with your email password
    pass: process.env.PASSWORD,
  },
});

module.exports = transporter;
