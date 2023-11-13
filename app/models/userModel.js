const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["customer", "rider"],
        default: "customer"
    },
    available_for_deliveries: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const userCollection = mongoose.model("users", userSchema);

module.exports = userCollection;