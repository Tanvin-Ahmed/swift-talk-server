const express = require("express");
const authController = require("../controller/auth");
const { sendOTP, verifyOTP } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register, sendOTP);
router.post("/login", authController.login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
