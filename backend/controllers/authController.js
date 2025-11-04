const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../config/generateToken');
const otpGenerator = require('otp-generator');
// const twilio = require('twilio'); // Uncomment if using Twilio

// --- Utility Functions (Placeholders) ---

// Placeholder for sending SMS OTP (using console log)
const sendSmsOtp = async (phone, otp) => {
    // Implement Twilio or other SMS service logic here
    console.log(`[SMS MOCK] Sending OTP ${otp} to ${phone}`);
    // Example Twilio code (requires twilio package and environment variables)
    /*
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
        body: `Your PharmaCare verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
    */
};

// --- Email/Password Controllers ---

// @desc    Register a new user (Email/Password)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType, pharmacyName } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error('Please enter all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const userData = { name, email, password, userType };
  if (userType === 'pharmacist') {
      userData.pharmacyName = pharmacyName;
  }

  // Create user
  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: generateToken(user._id, user.userType),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user (Email/Password)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: generateToken(user._id, user.userType),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// --- Phone/OTP Controllers ---

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error('Phone number is required');
    }
    
    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    
    // Set OTP to expire in 10 minutes
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    // Find or create user to store OTP
    let user = await User.findOne({ phone });

    // For new user registration flow (as per your frontend setup, we allow phone to not exist for signup)
    if (!user) {
        // Just send the OTP for verification for now, actual user creation happens in /register-phone
        // We will temporarily store OTP in the session or a temporary collection in a real app, 
        // but for simplicity with one User model, we'll store it on a *new* or existing user entry.
        // For a new signup, this is complex. The frontend must send ALL registration data on verify!
        // For now, we only focus on sending the OTP.
    }
    
    // Store OTP on user document if it exists, otherwise frontend handles the context
    // For this simple mock, we'll assume the client is handling the signup flow.
    // In a real flow, you'd save the OTP on the server and check it.
    
    // MOCK: Update any user that matches the phone with the new OTP (bad practice, but simple mock)
    await User.updateOne(
        { phone }, 
        { otp: otp, otpExpires: otpExpires }, 
        { upsert: true } // Creates new if not found (needs more data on client for a full user)
    );
    
    // Call the mock SMS function
    await sendSmsOtp(phone, otp);

    res.json({ message: 'OTP sent successfully. You can now verify.' });
});


// @desc    Register and Login via Phone/OTP
// @route   POST /api/auth/register-phone (Used for both login and final signup step)
// @access  Public
const registerPhone = asyncHandler(async (req, res) => {
    const { name, phone, otp, userType, pharmacyName } = req.body;

    if (!phone || !otp || !userType) {
        res.status(400);
        throw new Error('Phone, OTP, and User Type are required.');
    }

    // 1. Find user (or temporary entry) by phone and check OTP
    let user = await User.findOne({ phone });

    // OTP verification check
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    // 2. Clear OTP and mark as verified/logged in
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    
    // 3. Update/Complete Registration if it's a new user flow
    if (!user.name) { // Simple check to see if registration is complete
        user.name = name;
        user.userType = userType;
        if (userType === 'pharmacist') {
            user.pharmacyName = pharmacyName;
        }
    }
    await user.save();


    // 4. Respond with token
    res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        token: generateToken(user._id, user.userType),
    });
});


module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  registerPhone,
};