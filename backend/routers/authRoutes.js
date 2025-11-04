const express = require('express');
const { registerUser, loginUser, sendOtp, registerPhone } = require('../controllers/authController');

const router = express.Router();

// Email/Password Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Phone/OTP Auth
router.post('/send-otp', sendOtp);
router.post('/register-phone', registerPhone); // Used for final step of phone signup/login

module.exports = router;