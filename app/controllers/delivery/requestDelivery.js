const { deliveries } = require("../../models");
// const { io } = require("../../../index"); // import io exported from index.js

async function requestDelivery (req, res) {
    try {
        const { address, destination_address, item_weight } = req.body;
        const { user_id } = req.decoded;

        if (!user_id) {
            return res.status(400).send({
                success: false,
                error: "User id not found",
            })
        }

        const delivery_id = await deliveries.create({
            customer_id: user_id,
            rider_id: null,
            address,
            destination_address,
            item_weight,
            shipping_cost: 1000,
            shipping_status: "pending"
        })

        // Send message to all members of the availableRiders room in websocket
        // This message isn't stored in the notifications database though...Perhaps it should in a different database🤔
        // io.to("availableRiders").emit("message", `Delivery requested for Package: ${delivery_id} from ${address} to ${destination_address}!`);

        res.status(201).send({
            success: true,
            message: "Delivery request created successfully!"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Request failed unexpectedly!",
        });
    }
}

module.exports = requestDelivery;