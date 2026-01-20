const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

/* ---------------------------------------------------------
   GET USER PROFILE
--------------------------------------------------------- */
const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    address: req.user.address,
    pincode: req.user.pincode,
    pharmacyName: req.user.pharmacyName,
    licenseNumber: req.user.licenseNumber,
    userType: req.user.userType,
    isVerified: req.user.isVerified,
    createdAt: req.user.createdAt
  });
});


/* ---------------------------------------------------------
   TWILIO CLIENT
--------------------------------------------------------- */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ---------------------------------------------------------
   EMAIL TRANSPORTER
--------------------------------------------------------- */
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ---------------------------------------------------------
   SEND EMAIL OTP FUNCTION
--------------------------------------------------------- */
const sendEmailOtp = async (email, otp) => {
  try {
    await emailTransporter.sendMail({
      from: `"PharmaCare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.log("OTP Email Error:", error.message);
    return false;
  }
};

/* ---------------------------------------------------------
   SEND OTP - Only for Password Reset (Forgot Password)
--------------------------------------------------------- */
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const cleanEmail = email.toLowerCase().trim();
  
  // Check if user exists
  const user = await User.findOne({ email: cleanEmail });
  
  if (!user) {
    res.status(404);
    throw new Error("No account found with this email");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Send OTP via email
  const emailSent = await sendEmailOtp(cleanEmail, otp);
  if (!emailSent) {
    res.status(500);
    throw new Error("Failed to send OTP email");
  }

  // Store OTP in database
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  res.json({ 
    message: "OTP sent successfully to your email",
    email: cleanEmail 
  });
});

/* ---------------------------------------------------------
   REGISTER USER - Email + Password (No OTP Required)
--------------------------------------------------------- */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType, pharmacyName, address, pincode } = req.body;

  // Validation
  if (!name || !email || !password || !userType || !address || !pincode) {
    res.status(400);
    throw new Error("Please provide name, email, password, and user type");
  }

  

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if user already exists
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  // Create user data
    const userData = {
    name,
    email: cleanEmail,
    password,
    userType,
    isVerified: true,
    address,
    pincode,
  };

  const user = await User.create({
    ...userData,
    activatedAt: new Date() // 🔥 Set activation time
  });

  // Add pharmacy name for pharmacists
  if (userType === "pharmacist") {
    if (!pharmacyName) {
      res.status(400);
      throw new Error("Pharmacy name is required for pharmacists");
    }
    userData.pharmacyName = pharmacyName;
  }

  // Create user
  // const user = await User.create(userData);

  // Return user data with token
   res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    address: user.address,
    pincode: user.pincode,
    userType: user.userType,
    pharmacyName: user.pharmacyName,
    token: generateToken(user._id, user.userType),
    message: "Account created successfully"
  });
});

/* ---------------------------------------------------------
   LOGIN USER - Email + Password
--------------------------------------------------------- */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const cleanEmail = email.toLowerCase().trim();

  // Find user by email
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check if user has set a password
  if (!user.password) {
    res.status(400);
    throw new Error("Please reset your password using 'Forgot Password'");
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Return user data with token
  res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  pincode: user.pincode,
  userType: user.userType,
  pharmacyName: user.pharmacyName,
  token: generateToken(user._id, user.userType),
  message: "Login successful"
});
});

/* ---------------------------------------------------------
   RESET PASSWORD - Verify OTP and Set New Password
--------------------------------------------------------- */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error("Email, OTP, and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if OTP exists
  if (!user.otp || !user.otpExpires) {
    res.status(400);
    throw new Error("Please request OTP first");
  }

  // Verify OTP expiry
  if (Date.now() > new Date(user.otpExpires).getTime()) {
    res.status(400);
    throw new Error("OTP expired. Please request a new one");
  }

  // Verify OTP match
  if (user.otp.toString().trim() !== otp.toString().trim()) {
    res.status(400);
    throw new Error("Incorrect OTP");
  }

  // Reset password
  user.password = newPassword;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ 
    message: "Password reset successfully. You can now login with your new password",
    token: generateToken(user._id, user.userType),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      pharmacyName: user.pharmacyName
    }
  });
});

/* ---------------------------------------------------------
   UPDATE USER PROFILE
--------------------------------------------------------- */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, pincode, pharmacyName, licenseNumber } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Always allow fields to update, even if empty
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (pincode !== undefined) user.pincode = pincode;

  if (user.userType === "pharmacist") {
    if (pharmacyName !== undefined) user.pharmacyName = pharmacyName;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
  }

  const updatedUser = await user.save();

  // Return full user info (not raw mongoose object)
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    pincode: updatedUser.pincode,
    userType: updatedUser.userType,
    pharmacyName: updatedUser.pharmacyName,
    licenseNumber: updatedUser.licenseNumber,
    isVerified: updatedUser.isVerified,
    createdAt: updatedUser.createdAt,
  });
});



/* ---------------------------------------------------------
   VERIFY OTP - Legacy support (can be removed if not needed)
--------------------------------------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  res.status(400);
  throw new Error("This endpoint is deprecated. Please use /register for signup and /login for login");
});

/* ---------------------------------------------------------
   SET PASSWORD - Legacy support (can be removed if not needed)
--------------------------------------------------------- */
const setPassword = asyncHandler(async (req, res) => {
  res.status(400);
  throw new Error("This endpoint is deprecated. Please use /reset-password for password recovery");
});

/* ---------------------------------------------------------
   EXPORTS
--------------------------------------------------------- */
module.exports = {
  sendOtp,           // For forgot password only
  verifyOtp,         // Deprecated
  registerUser,      // Email + Password signup
  loginUser,         // Email + Password login
  getUserProfile,
  updateUserProfile,
  setPassword,       // Deprecated
  resetPassword,     // For forgot password flow
};