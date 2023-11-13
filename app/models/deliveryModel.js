const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    rider_id: {
        type: String,
        default: null,
        // required: true
    },
    address: {
        type: String,
        required: true
    },
    destination_address: {
        type: String,
        required: true
    },
    item_weight: {
        type: Number,
        required: true
    },
    shipping_cost: {
        type: Number,
        default: 1000,
        // required: true
    },
    shipping_status: {
        type: String,
        enum: ["pending", "in-transit", "delivered"],
        default: "pending"
    }
}, { timestamps: true })

const deliveryCollection = mongoose.model("deliveries", deliverySchema);

module.exports = deliveryCollection;