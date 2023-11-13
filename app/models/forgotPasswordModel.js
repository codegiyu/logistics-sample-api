const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    otp: {
        type: String,
        required: true
    }
});

const forgotPasswordCollection = mongoose.model("forgotPassword", forgotPasswordSchema);

module.exports = forgotPasswordCollection;