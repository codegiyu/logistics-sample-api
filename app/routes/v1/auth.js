const express = require("express");
const router = express.Router();
const { login, registerRider, registerCustomer, forgotPassword, resetPassword } = require("../../controllers/auth");
const { validateRequest } = require("../../middlewares");

router.post("/register/rider", validateRequest("v1/auth/register"), registerRider);
router.post("/register/customer", validateRequest("v1/auth/register"), registerCustomer);
router.post("/login", validateRequest("v1/auth/login"), login);
router.post("/forgot-password", validateRequest("v1/auth/forgot-password"), forgotPassword);
router.post("/reset-password", validateRequest("v1/auth/reset-password"), resetPassword);

module.exports = router;