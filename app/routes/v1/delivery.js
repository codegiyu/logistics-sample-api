const express = require("express");
const router = express.Router();
const { getAllDeliveries, requestDelivery } = require("../../controllers/delivery");
const { isLoggedIn, isCustomer, validateRequest } = require("../../middlewares");

router.get("/all-deliveries", isLoggedIn, isCustomer, getAllDeliveries);
// router.post("/request-delivery", isLoggedIn, isCustomer, validateRequest("v1/delivery/request-delivery"), requestDelivery);

module.exports = router;