const mongoose = require("mongoose");
const userCollection = require("./userModel");
const deliveryCollection = require("./deliveryModel");
const notificationCollection = require("./notificationModel");
const forgotPasswordCollection = require("./forgotPasswordModel");

mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.users = userCollection;
db.deliveries = deliveryCollection;
db.notifications = notificationCollection;
db.forgotPasswordInfos = forgotPasswordCollection;

module.exports = db;