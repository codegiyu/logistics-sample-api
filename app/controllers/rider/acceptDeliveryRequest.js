const { deliveries, notifications, users } = require("../../models");
const { io } = require("../../../index");
const usersSocketMap = require("../../websocket/usersSocketMap");

async function acceptDeliveryRequest (data, callback) {
    // try {
    //     const { user_id } = req.decoded;
    //     const { delivery_id } = data;

    //     if (!user_id) {
    //         return callback({
    //             status: 400,
    //             success: false,
    //             error: "User id not found",
    //         })
    //     }

    //     const delivery = await deliveries.findByIdAndUpdate(delivery_id, {
    //         rider_id: user_id.toString(),
    //         shipping_status: "in-transit"
    //     })

    //     if (!delivery) {
    //         return callback({
    //             status: 404,
    //             success: false,
    //             error: "No such delivery request"
    //         })
    //     }

    //     const { _id, customer_id } = delivery;

    //     await users.findByIdAndUpdate(user_id, {
    //         available_for_deliveries: false
    //     })

    //     const notificationMessage = `Your package with Delivery ID: ${delivery_id} has been shipped by Rider: ${user_id.toString()}.`;

    //     await notifications.create({
    //         customer_id,
    //         rider_id: user_id,
    //         delivery_id: _id,
    //         title: "Package Shipped",
    //         message: notificationMessage,
    //         status: "unread"
    //     })

    //     // Get customer's socket id from users socket map
    //     const customerSocketId = usersSocketMap.get(customer_id.toString());

    //     // Send notification to customer that their package has been shipped if socket id exists
    //     if (customerSocketId) {
    //         io.to(customerSocketId).emit("notification", notificationMessage);
    //     }
        
    // } catch (error) {
    //     console.log(error);
    //     return callback({
    //         status: 500,
    //         success: false,
    //         error: error.message,
    //         message: "Request failed unexpectedly!",
    //     });
    // }
}

module.exports = acceptDeliveryRequest;