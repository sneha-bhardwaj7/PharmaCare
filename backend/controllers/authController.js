const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

/* ---------------------------------------------------------
   TWILIO CLIENT
--------------------------------------------------------- */
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ---------------------------------------------------------
   EMAIL TRANSPORT (NO PASSWORD FROM USER)
--------------------------------------------------------- */
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // your gmail
    pass: process.env.EMAIL_PASSWORD,   // your app password
  },
});

/* ---------------------------------------------------------
   SEND EMAIL OTP
--------------------------------------------------------- */
const sendEmailOtp = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"PharmaCare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your PharmaCare Verification Code",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #4A4AFF;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✔ OTP emailed to: ${email}`);
    return true;

  } catch (error) {
    console.log("Email Error:", error.message);
    return false;
  }
};

/* ---------------------------------------------------------
   SEND OTP (PHONE OR EMAIL)
--------------------------------------------------------- */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    res.status(400);
    throw new Error("Phone or Email is required");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  let user;

  /* ---------------------- PHONE OTP ---------------------- */
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      res.status(400);
      throw new Error("Invalid phone number");
    }

    await twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${cleanPhone}`,
        channel: "sms",
      });

    user = await User.findOneAndUpdate(
      { phone: cleanPhone },
      { otp, otpExpires },
      { new: true, upsert: true }
    );
  }

  /* ---------------------- EMAIL OTP ---------------------- */
  if (email) {
    const cleanEmail = email.toLowerCase().trim();

    await sendEmailOtp(cleanEmail, otp);

    user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { otp, otpExpires },
      { new: true, upsert: true }
    );
  }

  res.json({ message: "OTP sent successfully" });
});

/* ---------------------------------------------------------
   VERIFY OTP (EMAIL OR PHONE)
--------------------------------------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  const { name, phone, email, otp, userType, pharmacyName } = req.body;

  if (!otp || (!phone && !email)) {
    res.status(400);
    throw new Error("OTP and Phone/Email are required");
  }

  // Identify user
  let query = {};
  if (phone) query.phone = phone.replace(/\D/g, "");
  if (email) query.email = email.toLowerCase().trim();

  let user = await User.findOne(query);

  if (!user) {
    res.status(404);
    throw new Error("User not found. Please request OTP first.");
  }

  // OTP Validation
  if (user.otp !== otp || user.otpExpires < new Date()) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // OTP Verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  if (name && !user.name) user.name = name;
  if (userType) user.userType = userType;

  if (userType === "pharmacist") {
    if (!pharmacyName) {
      res.status(400);
      throw new Error("Pharmacy name required");
    }
    user.pharmacyName = pharmacyName;
  }

  await user.save();

  res.json({
    message: "OTP verified successfully",
    user,
    token: generateToken(user._id, user.userType),
  });
});

/* ---------------------------------------------------------
   REGISTER (EMAIL + PASSWORD)
--------------------------------------------------------- */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType, pharmacyName } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error("Please enter all required fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
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
    _id: user._id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    token: generateToken(user._id, user.userType),
  });
});

/* ---------------------------------------------------------
   LOGIN (EMAIL + PASSWORD)
--------------------------------------------------------- */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email + Password required");
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    userType: user.userType,
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
};
