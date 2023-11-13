const validateRequest = require("./validateRequest");
const isRider = require("./isRider");
const isCustomer = require("./isCustomer");
const isLoggedIn = require("./isLoggedIn");

module.exports = {
    validateRequest,
    isLoggedIn,
    isCustomer,
    isRider
}