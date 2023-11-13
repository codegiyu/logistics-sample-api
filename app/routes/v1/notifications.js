const express = require("express");
const router = express.Router();
const { getAllNotifications, getUnreadNotifications, markNotificationAsRead, markNotificationAsUnread } = require("../../controllers/notifications");
const { isLoggedIn, isCustomer } = require("../../middlewares");

router.get("/all-notifications", isLoggedIn, isCustomer, getAllNotifications);
router.get("/unread-notifications", isLoggedIn, isCustomer, getUnreadNotifications);
router.patch("/mark-read/:id", isLoggedIn, isCustomer, markNotificationAsRead);
router.patch("/mark-unread/:id", isLoggedIn, isCustomer, markNotificationAsUnread);

module.exports = router;