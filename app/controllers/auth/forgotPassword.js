const { users, forgotPasswordInfos } = require("../../models");
const { send } = require("../../utils/sendMail");
const otpGenerator = require('otp-generator');
const AES = require("crypto-js/aes");
require("dotenv").config();

async function forgotPassword (req, res) {
    try {
        const { email } = req.body;

        const user = await users.findOne({ email });

        if (!user) {
        return res.status(404).send({
            success: false,
            error: "no-user-found",
            message: "No user found with that email",
        });
        }

        const otp = otpGenerator.generate(6, { 
            digits: true, 
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false 
        })
        
        const cipherText = AES.encrypt(JSON.stringify(user._id), process.env.cryptoSecret).toString();

        await forgotPasswordInfos.create({
            user_id: user._id,
            otp
        });

        await send.sendMail({
        to: email,
        subject: "Password Reset",
        html: `
                <div style="background: #F6F6F6; padding: 16px 16px 40px;">
                    <h1 
                        style="padding: 16px; background: #17374C; color: white; font-size: 20px; 
                        font-weight: 700; border-radius: 5px; text-align: center;"
                    >
                        Password Reset
                    </h1>
                    <p>Click <a href="">here</a> to reset your password</p></br></br>
                    <p>Cipher: ${cipherText}</p>
                    <p>OTP: ${otp}</p></br></br>
                    <i>Have fun😉</i>
                </div>
            `,
        });

        res.status(200).send({
            success: true,
            message: "Email sent Successfully!"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Request failed unexpectedly!",
        });
    }
}

module.exports = forgotPassword;