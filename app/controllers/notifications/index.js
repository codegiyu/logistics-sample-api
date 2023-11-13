const getAllNotifications = require("./getAllNotifications");
const getUnreadNotifications = require("./getUnreadNotifications");
const markNotificationAsRead = require("./markNotificationAsRead");
const markNotificationAsUnread = require("./markNotificationAsUnread");

module.exports = {
    getAllNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markNotificationAsUnread
}