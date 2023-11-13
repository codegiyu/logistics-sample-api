const express = require("express");
const http = require("http"); // import http to be used to create server for websocket
const { Server } = require("socket.io"); // import server from socket.io
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const config = require("./app/config/auth.config");
const { 
    v1AuthRoutes, 
    v1DeliveryRoutes, 
    v1RiderRoutes, 
    v1NotificationRoutes 
} = require("./app/routes/v1"); // import the api routes
const usersSocketMap = require("./app/websocket/usersSocketMap");
const { users, deliveries, notifications } = require("./app/models");

const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app); // create server for socket
const io = new Server(server, {
    cors: { origin: "*" }
}); // create websocket server instance for our app and add cors

// Handle MongoDB connection with mongoose
const { mongoUserName, password, clusterName, dbName } = process.env;
const mongoDB_URI = `mongodb+srv://${mongoUserName}:${password}@${clusterName}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(mongoDB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => console.log("Database connected!"))
.catch((err) => console.log(`Error connecting to database! `, err));

// Handle Websocket connection
io.on("connection", async (socket) => {
    socket.emit("message", `Client connected with socket ID: ${socket.id}!`)

    // Get token passed from client on connection and decode user_id and role from it
    const { token } = socket.handshake.query;
    let user_id, role;

    if (token) {
        const decoded = jwt.verify(token, config.secret);
        user_id = decoded.user_id; 
        role = decoded.role; 
    }

    // if user id or role are falsy, disconnect client
    if (!user_id || !role) {
        socket.emit("message", "Token invalid or not found!");
        socket.disconnect(true);
        return;
    }

    // Add user id and socket id to users socket map
    usersSocketMap.set(user_id, socket.id)

    try {
        // If user is a rider check if they have any ongoing deliveries
        if (role === "rider") {
            const ongoingDelivery = await deliveries.find({ rider_id: user_id, shipping_status: "in transit" })
            console.log(`Ongoing deliveries for user ${user_id}: `, ongoingDelivery)
    
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


    // Listen for the requestDelivery event
    socket.on("requestDelivery", async function (data, callback) {
        try {
            if (role !== "customer") {
                return callback({
                    status: 403,
                    success: false,
                    error: "Action not allowed for this user",
                });
            }

            const { address, destination_address, item_weight } = data;

            const delivery_id = await deliveries.create({
                customer_id: user_id,
                rider_id: null,
                address,
                destination_address,
                item_weight: Number(item_weight),
                shipping_cost: 1000,
                shipping_status: "pending"
            })

            // Send message to all members of the availableRiders room in websocket
            // This message isn't stored in the notifications database though...Perhaps it should in a different database🤔
            io.to("availableRiders").emit("serverMessage", `Delivery requested for Package: ${delivery_id._id} from ${address} to ${destination_address}!`);

            callback({
                status: 201,
                success: true,
                message: "Delivery request created successfully!"
            })
        } catch (error) {
            console.log(error);
            return callback({
                status: 500,
                success: false,
                error: error.message,
                message: "Request failed unexpectedly!",
            });
        }
    })


    // Listen for the acceptDelivery event
    socket.on("acceptDelivery", async function (data, callback) {
        try {
            if (role !== "rider") {
                return callback({
                    status: 403,
                    success: false,
                    error: "Action not allowed for this user",
                });
            }

            const { delivery_id } = data;

            // Get delivery record with delivery id
            const delivery = await deliveries.findById(delivery_id);

            // Get rider record
            const rider = await users.findById(user_id);
    
            if (!delivery) {
                return callback({
                    status: 404,
                    success: false,
                    error: "No such delivery request"
                })
            }
    
            const { _id, customer_id, rider_id, shipping_status } = delivery;
            const { available_for_deliveries } = rider;

            // If rider id exists in the record or shipping status is not "pending", bounce the request immediately
            if (rider_id || shipping_status !== "pending") {
                console.log(rider_id, shipping_status)
                return callback({
                    status: 401,
                    success: false,
                    error: "This delivery is not available to be accepted"
                })
            }

            // If rider is unavailable for deliveries, bounce the request immediately
            if (!available_for_deliveries) {
                return callback({
                    status: 401,
                    success: false,
                    error: "This rider is not available for deliveries"
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
    
            const notificationMessage = `Your package with Delivery ID: ${delivery_id} has been shipped by Rider: ${user_id}.`;
    
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
            socket.leave("availableRiders");
            console.log(`Rider ${user_id} left availableRiders`);
    
            // Send notification to customer that their package has been shipped if socket id exists
            if (customerSocketId) {
                io.to(customerSocketId).emit("notification", notificationMessage);
            }

            callback({
                status: 200,
                success: true,
                message: "Delivery request accepted successfully!"
            })
            
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
            if (role !== "rider") {
                return callback({
                    status: 403,
                    success: false,
                    error: "Action not allowed for this user",
                });
            }

            const { delivery_id } = data;

            const delivery = await deliveries.findById(delivery_id);
    
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
    
            const notificationMessage = `Your package with Delivery ID: ${delivery_id} has been delivered by Rider: ${user_id}.`;
    
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

            callback({
                status: 200,
                success: true,
                message: "Delivery request completed successfully!"
            })
            
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
            socket.emit("notification", `User: ${user_id} socket connection disconnected`);

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
});

// Some Express settings
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Handle Express routes
app.get("/", (req, res) => { res.send("Logistics API database is online!"); });
app.use("/v1/auth", v1AuthRoutes);
app.use("/v1/delivery", v1DeliveryRoutes);
app.use("/v1/rider", v1RiderRoutes);
app.use("/v1/notification", v1NotificationRoutes);

server.listen(port, () => console.log("App started and lisening on port ", port));

// app is exported because it will be used in testing with supertest and jest
module.exports = { app };