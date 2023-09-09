const express = require("express");
const path = require("path");
const handlebar = require("handlebars");
const fs = require("fs");
const nodemailer = require("nodemailer");
const config = require("config");
const { auth } = require("../middleware/authorization");

const smtpUser = config.get("smtpConfig.userName");
const smtpPassword = config.get("smtpConfig.passWord");
const smtpHost = config.get("smtpConfig.server");
const smtpPort = config.get("smtpConfig.port");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: smtpHost || "smtp.gmail.com",
  port: smtpPort || "465",
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

router.post("/", auth, async (req, res) => {
  const filePath = path.join(__dirname, "../mails/index.html");
  const file = fs.readFileSync(filePath).toString();
  const user = req.user;
  const { to } = req.body;
  const template = handlebar.compile(file);
  const mailTemplate = template({ invitee: user?.surname + " " + user?.name });
  const mailOptions = {
    from: smtpUser,
    to: to,
    subject: "Invitation",
    html: mailTemplate,
  };
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).send("Email submitted successfull");
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
