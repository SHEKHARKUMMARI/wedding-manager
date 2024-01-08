const express = require("express");
const path = require("path");
const handlebar = require("handlebars");
const fs = require("fs");
const nodemailer = require("nodemailer");
const config = require("config");
const { formateDateToLocaleDateString } = require("./date");

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
const weddingInvitation = async ({ wedding, guest_email, invitee_email }) => {
  const filePath = path.join(
    __dirname,
    "../mails/templates/wedding-invitation.html"
  );
  const file = fs.readFileSync(filePath).toString();
  const template = handlebar.compile(file);

  const currentDate = new Date();
  const tenDaysLater = new Date();
  tenDaysLater.setDate(currentDate.getDate() + 10);

  const templateVariables = {
    groom: `${wedding?.groom?.surname} ${wedding?.groom?.name}`,
    bride: `${wedding?.bribe?.surname} ${wedding?.bribe?.name}`,
    wedding_date: `${formateDateToLocaleDateString(wedding?.wedding_date)}`,
    venue: `${wedding?.avenue}`,
    rsvp_date: `${formateDateToLocaleDateString(tenDaysLater)}`,
  };

  const mailTemplate = template(templateVariables);
  const mailOptions = {
    from: invitee_email,
    to: guest_email,
    subject: "Wedding Invitation",
    html: mailTemplate,
  };
  try {
    const req = await transporter.sendMail(mailOptions);
    return req;
  } catch (err) {
    return err;
  }
};
module.exports = { registerUser, weddingInvitation };
