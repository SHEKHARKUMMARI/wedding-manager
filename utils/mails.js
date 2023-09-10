const express = require("express");
const path = require("path");
const handlebar = require("handlebars");
const fs = require("fs");
const nodemailer = require("nodemailer");
const config = require("config");

const smtpUser = config.get("smtpConfig.userName");
const smtpPassword = config.get("smtpConfig.passWord");
const smtpHost = config.get("smtpConfig.server");
const smtpPort = config.get("smtpConfig.port");

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

const registerUser = async (userEmail) => {
  const filePath = path.join(__dirname, "../mails/templates/index.html");
  const file = fs.readFileSync(filePath).toString();
  const template = handlebar.compile(file);
  const mailTemplate = template({ invitee: user?.surname + " " + user?.name });
  const mailOptions = {
    from: smtpUser,
    to: userEmail,
    subject: "Invitation",
    html: mailTemplate,
  };
  try {
    await transporter.sendMail(mailOptions);
    return "Email submitted successfull";
  } catch (err) {
    return "Error while Inviting";
  }
};
const weddingInvitation = async ({ invitee, invitor }) => {
  const filePath = path.join(
    __dirname,
    "../mails/templates/wedding-invitation.html"
  );
  const file = fs.readFileSync(filePath).toString();
  const template = handlebar.compile(file);
  const templateVariables = {
    invitee: `${invitee?.name} ${invitee.surname}`,
    invitor: `${invitor?.name} ${invitor.surname}`,
  };

  const mailTemplate = template(templateVariables);
  const mailOptions = {
    from: smtpUser,
    to: invitee.email,
    subject: "Invitation",
    html: mailTemplate,
  };

  await transporter.sendMail(mailOptions);
  return "Email submitted successfull";
};
module.exports = { registerUser, weddingInvitation };
