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
    pharmacyName: req.user.pharmacyName,
    userType: req.user.userType
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
      subject: "Verification OTP",
      html: `<h2>Your OTP: <b>${otp}</b></h2>`,
    });
    return true;
  } catch (error) {
    console.log("OTP Email Error:", error.message);
    return false;
  }
};

/* ---------------------------------------------------------
   SEND OTP (EMAIL / PHONE)
--------------------------------------------------------- */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    res.status(400);
    throw new Error("Phone or Email required");
  }

  let user;

  // Phone OTP via Twilio
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      res.status(400);
      throw new Error("Invalid phone number");
    }

    // Send OTP via Twilio Verify Service
    await twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${cleanPhone}`,
        channel: "sms",
      });

    await User.findOneAndUpdate(
      { phone: cleanPhone },
      { phone: cleanPhone },
      { new: true, upsert: true }
    );
  }
  // Email OTP Storage
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Valid date object

    const emailSent = await sendEmailOtp(cleanEmail, otp);
    if (!emailSent) {
      res.status(500);
      throw new Error("Failed to send OTP email");
    }

    await User.findOneAndUpdate(
      { email: cleanEmail },
      { otp, otpExpires },
      { new: true, upsert: true }
    );
  }

  res.json({ message: "OTP sent successfully" });
});
/* ---------------------------------------------------------
   VERIFY OTP
--------------------------------------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  const { name, phone, email, otp, userType, pharmacyName } = req.body;

  if (!otp || (!phone && !email)) {
    res.status(400);
    throw new Error("OTP and Phone/Email required");
  }

  let user;
  let query = {};

  /* PHONE OTP VERIFY */
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "");

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: `+91${cleanPhone}`,
          code: otp,
        });

      if (verificationCheck.status !== "approved") {
        res.status(400);
        throw new Error("Invalid or expired OTP");
      }
    } catch {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    query.phone = cleanPhone;
    user = await User.findOne(query);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.isVerified = true;
    if (name && !user.name) user.name = name;
    if (userType) user.userType = userType;
    if (userType === "pharmacist" && pharmacyName) {
      user.pharmacyName = pharmacyName;
    }

    await user.save();

    return res.json({
      token: generateToken(user._id, user.userType),
      user,
    });
  }

  /* EMAIL OTP VERIFY */
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    query.email = cleanEmail;

    user = await User.findOne(query);

    if (!user) {
      res.status(400);
      throw new Error("Please request OTP first");
    }

    // Expiry Check (millisecond comparison)
    if (Date.now() > new Date(user.otpExpires).getTime()) {
      res.status(400);
      throw new Error("OTP expired");
    }

    // OTP Match
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      res.status(400);
      throw new Error("Incorrect OTP");
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    if (name && !user.name) user.name = name;
    if (userType) user.userType = userType;
    if (userType === "pharmacist" && pharmacyName) {
      user.pharmacyName = pharmacyName;
    }

    await user.save();

    // IMPORTANT — Return immediately
    return res.json({
      token: generateToken(user._id, user.userType),
      user,
    });
  }
});

/* ---------------------------------------------------------
   UPDATE USER PROFILE
--------------------------------------------------------- */
const updateUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, phone, address, pharmacyName, licenseNumber } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  if (user.userType === "pharmacist") {
    if (pharmacyName) user.pharmacyName = pharmacyName;
    if (licenseNumber) user.licenseNumber = licenseNumber;
  }

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

/* ---------------------------------------------------------
   REGISTER
--------------------------------------------------------- */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType, pharmacyName } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const data = {
    name,
    email,
    password,
    userType,
    isVerified: true,
  };

  if (userType === "pharmacist") {
    if (!pharmacyName) {
      res.status(400);
      throw new Error("Pharmacy name required");
    }
    data.pharmacyName = pharmacyName;
  }

  const user = await User.create(data);

  res.json({
    ...user.toObject(),
    token: generateToken(user._id, user.userType),
  });
});

/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  res.json({
    ...user.toObject(),
    token: generateToken(user._id, user.userType),
  });
});

/* ---------------------------------------------------------
   EXPORTS
--------------------------------------------------------- */
module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
