const { io } = require("../../index");
const { users, deliveries, notifications } = require("../models");
const usersSocketMap = require("./usersSocketMap");
// const { acceptDeliveryRequest, markDeliveryAsCompleted } = require("../controllers/rider");

const handleWebsocketConnection = async (socket) => {
    console.log(socket);

    // Get userid and role passed from client on connection
    const { user_id, role } = socket.handshake.query; 

    // if user id or role are falsy, disconnect client
    if (!user_id || !role) {
        socket.disconnect(true);
        return;
    }

    // Add user id and socket id to users socket map
    usersSocketMap.set(user_id, socket.id)

    try {
        // If user is a rider check if they have any ongoing deliveries
        if (role === "rider") {
            const ongoingDelivery = await deliveries.find({ rider_id: user_id, shipping_status: "in transit" })
            console.log(ongoingDelivery)
    
            // If no ongoing deliveries...
            if (!ongoingDelivery.length) {
                // add user to the availableRiders room so they'll get informed when a new delivery is requested
                socket.emit("joinRoom", "availableRiders");
    
                // Set availability_for_delivery for that rider to true
                await users.findByIdAndUpdate(user_id, {
                    available_for_deliveries: true
                })
            }
        }
    } catch (error) {
        console.log("Error on socket connection: ", error);
    }


    // Listen for the acceptDelivery event
    socket.on("acceptDelivery", async function (data, callback) {
        try {
            const { delivery_id } = data;

            // Get delivery record with delivery id
            const delivery = deliveries.findById(delivery_id);

            // Get rider record
            const rider = users.findById(user_id);
    
            if (!delivery) {
                return callback({
                    status: 404,
                    success: false,
                    error: "No such delivery request"
                })
            }
    
            const { _id, customer_id, rider_id, shipping_status } = delivery;
            const { available_for_deliveries } = rider;

            // If rider id exists in the record or shipping status is not "pending" or rider is unavailable for deliveries, bounce the request immediately
            if (rider_id != null || shipping_status !== "pending" || !available_for_deliveries) {
                return callback({
                    status: 401,
                    success: false,
                    error: "This delivery is not available to be accepted"
                })
            }
    
            // Update rider id and shipping status in the delivery record
            await deliveries.findByIdAndUpdate(delivery_id, {
                rider_id: user_id.toString(),
                shipping_status: "in-transit"
            })
    
            // Update rider record to show unavailability for deliveries
            await users.findByIdAndUpdate(user_id, {
                available_for_deliveries: false
            })
    
            const notificationMessage = `Your package with Delivery ID: ${delivery_id} has been shipped by Rider: ${user_id.toString()}.`;
    
            // Create new notification in the database
            await notifications.create({
                customer_id,
                rider_id: user_id,
                delivery_id: _id,
                title: "Package Shipped",
                message: notificationMessage,
                status: "unread"
            })
    
            // Get customer's socket id from users socket map
            const customerSocketId = usersSocketMap.get(customer_id.toString());

            // Remove rider's socket id from availableRiders room
            socket.emit("leaveRoom", "availableRiders");
    
            // Send notification to customer that their package has been shipped if socket id exists
            if (customerSocketId) {
                io.to(customerSocketId).emit("notification", notificationMessage);
            }
            
        } catch (error) {
            console.log(error);
            return callback({
                status: 500,
                success: false,
                error: error.message,
                message: "Request failed unexpectedly!",
            });
        }
    });

    // Listen for the markDeliveryComplete event
    socket.on("markDeliveryComplete", async function (data, callback) {
        try {
            const { delivery_id } = data;

            const delivery = deliveries.findById(delivery_id);
    
            if (!delivery) {
                return callback({
                    status: 404,
                    success: false,
                    error: "No such delivery request"
                })
            }
    
            const { _id, customer_id, rider_id, shipping_status } = delivery;

            if (rider_id != null || shipping_status !== "pending") {
                return callback({
                    status: 401,
                    success: false,
                    error: "This delivery is not available to be accepted"
                })
            }
    
            // Update delivery record status to delivered
            await deliveries.findByIdAndUpdate(delivery_id, {
                shipping_status: "delivered"
            })
    
            // Update Rider's record to show availability for deliveries
            await users.findByIdAndUpdate(user_id, {
                available_for_deliveries: true
            })
    
            const notificationMessage = `Your package with Delivery ID: ${delivery_id} has been delivered by Rider: ${user_id.toString()}.`;
    
            // Create new notification in the database
            await notifications.create({
                customer_id,
                rider_id: user_id,
                delivery_id: _id,
                title: "Package Delivered",
                message: notificationMessage,
                status: "unread"
            })
    
            // Get customer's socket id from users socket map
            const customerSocketId = usersSocketMap.get(customer_id.toString());

            // Add rider's socket id to availableRiders room
            socket.emit("joinRoom", "availableRiders");
    
            // Send notification to customer that their package has been delivered if socket id exists
            if (customerSocketId) {
                io.to(customerSocketId).emit("notification", notificationMessage);
            }
            
        } catch (error) {
            console.log(error);
            return callback({
                status: 500,
                success: false,
                error: error.message,
                message: "Request failed unexpectedly!",
            });
        }
    });

    // Listen for and handle room events
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        const { user_id } = socket.handshake.query;
        console.log(`User ${user_id} has joined room: ${roomName}`)
    })

    socket.on("messageInRoom", (data) => {
        io.to(data.roomName).emit("groupMessage", data.message);
    })

    socket.on("leaveRoom", (roomName) => {
        socket.leave(roomName);
        const { user_id } = socket.handshake.query;
        console.log(`User ${user_id} has left room: ${roomName}`)
    })

    // Listen for socket disconnection
    socket.on("disconnect", async () => {
        try {
            console.log(`User: ${user_id} socket connection disconnected`);

            // Delete entry for that user from the user socket map
            usersSocketMap.delete(user_id);

            // If user is a rider, set their availability to false
            if (role === "rider") {
                await users.findByIdAndUpdate(user_id, {
                    available_for_deliveries: false
                })
            }
        } catch (error) {
            console.log("Error disconnecting socket: ", error)
        }
    })
}

module.exports = {
    handleWebsocketConnection
}