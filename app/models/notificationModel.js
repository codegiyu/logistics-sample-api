const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    rider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    delivery_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "deliveries",
        required: true
    },
    title: {
        type: String,
        enum: ["Package Shipped", "Package Delivered"],
        default: "Package Shipped",
        // required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["read", "unread"],
        default: "unread"
    }
}, { timestamps: true })

const notificationCollection = mongoose.model("notifications", notificationSchema);

module.exports = notificationCollection;