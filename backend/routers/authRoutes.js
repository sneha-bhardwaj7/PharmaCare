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
  resetPassword  // NEW
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);  // NEW - For forgot password flow

// Protected routes
router.post("/set-password", setPassword);
router.get("/me", protect, getUserProfile);
router.put('/update-profile', protect, updateUserProfile);

module.exports = router;