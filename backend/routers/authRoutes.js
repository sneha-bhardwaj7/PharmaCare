// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { 
  sendOtp, 
  verifyOtp, 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  setPassword,
  resetPassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/set-password", setPassword);

// Protected routes (authentication required)
router.get("/me", protect, getUserProfile);
router.put("/update-profile", protect, updateUserProfile);

module.exports = router;