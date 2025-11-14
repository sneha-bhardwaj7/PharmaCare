const express = require("express");
const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
} = require("../controllers/authController");

// AUTH ROUTES
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
