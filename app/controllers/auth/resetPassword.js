const { users, forgotPasswordInfos } = require("../../models");
const CryptoJS = require("crypto-js");
const AES = require("crypto-js/aes");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetPassword (req, res) {
    try {
        const { cipherText, otp, newPassword } = req.body;

        const user_id = JSON.parse(AES.decrypt(cipherText, process.env.cryptoSecret).toString(CryptoJS.enc.Utf8));
        
        const otpRecord = await forgotPasswordInfos.findOne({ user_id });
        
        if (!otpRecord){
            return res.status(404).send({
                success: false,
                error: "no-record-found",
                message: "OTP record not found"
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).send({
                success: false,
                error: "no-otp-match",
                message: "OTP sent does not match record",
            });
        }

        const newHashedPassword = bcrypt.hashSync(
            newPassword,
            bcrypt.genSaltSync(10)
        );

        await users.findByIdAndUpdate(user_id, {
            password: newHashedPassword,
        });

        await forgotPasswordInfos.findOneAndDelete({ user_id });

        res.status(200).send({
            success: true,
            message: "Password changed successfully!",
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

module.exports = resetPassword;