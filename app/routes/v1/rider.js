const express = require("express");
const router = express.Router();
const { getAllRiderDeliveries, acceptDeliveryRequest, markDeliveryAsCompleted } = require("../../controllers/rider");
const { isLoggedIn, isRider } = require("../../middlewares");

router.get("/all-deliveries", isLoggedIn, isRider, getAllRiderDeliveries);
// router.patch("/accept-request/:id", isLoggedIn, isRider, acceptDeliveryRequest);
// router.patch("/mark-complete/:id", isLoggedIn, isRider, markDeliveryAsCompleted);

module.exports = router;