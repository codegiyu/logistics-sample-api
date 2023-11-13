const sendMail = require("nodemailer");
require("dotenv").config();

const options = {
    service: "gmail",
    auth: {
        user: process.env.googleMail,
        pass: process.env.googlePassword
    }
}

const send = sendMail.createTransport(options);

module.exports = { send };