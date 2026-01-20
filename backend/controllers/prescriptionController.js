// backend/controllers/prescriptionController.js

const Prescription = require("../models/Prescription");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");

/* -------------------------- HELPER FUNCTION --------------------------- */
const uploadCloud = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "prescriptions" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

/* -------------------------- UPLOAD PRESCRIPTION ------------------------ */
exports.uploadPrescription = asyncHandler(async (req, res) => {
  console.log("=== PRESCRIPTION UPLOAD STARTED ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file ? "File present" : "No file");
  console.log("Request user ID:", req.user?._id);

  const { paymentMode } = req.body;
  
  // Check if file exists
  if (!req.file) {
    console.log("ERROR: No file uploaded");
    return res.status(400).json({ 
      success: false,
      message: "Prescription image required" 
    });
  }
  
  // Check if user is authenticated
  if (!req.user || !req.user._id) {
    console.log("ERROR: User not authenticated");
    return res.status(401).json({ 
      success: false,
      message: "User not authenticated" 
    });
  }

  try {
    // Fetch full user data from database
    console.log("Fetching user data for ID:", req.user._id);
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log("ERROR: User not found in database");
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("User found:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      pincode: user.pincode
    });

    // Validate required user fields
    if (!user.pincode) {
      console.log("ERROR: User pincode missing");
      return res.status(400).json({ 
        success: false,
        message: "User pincode missing. Please update your profile with pincode first." 
      });
    }

    if (!user.phone) {
      console.log("ERROR: User phone missing");
      return res.status(400).json({ 
        success: false,
        message: "User phone number missing. Please update your profile with phone number first." 
      });
    }

    if (!user.address) {
      console.log("ERROR: User address missing");
      return res.status(400).json({ 
        success: false,
        message: "User address missing. Please update your profile with address first." 
      });
    }

    // Upload to Cloudinary
    console.log("Uploading image to Cloudinary...");
    const cloudFile = await uploadCloud(req.file);
    console.log("Cloudinary upload successful:", cloudFile.secure_url);
    
    // Map payment mode to match enum values
    const validPaymentMethods = ["Cash", "Card", "UPI", "Insurance"];
    const paymentMethod = validPaymentMethods.includes(paymentMode) ? paymentMode : "Cash";
    
    console.log("Payment method:", paymentMethod);
    
    // Create prescription
    console.log("Creating prescription document...");
    const prescription = await Prescription.create({
      userId: user._id,
      imageUrl: cloudFile.secure_url,
      patientName: user.name,
      phone: user.phone,
      address: user.address,
      targetArea: user.pincode,
      items: [], // Empty array, pharmacist will add items when quoting
      deliveryType: "standard",
      prescriptionType: "acute",
      paymentMethod: paymentMethod,
      notes: "",
    });
    console.log("Prescription created with ID:", prescription._id);

    // Find all pharmacists in the same pincode
    console.log("Finding pharmacists in pincode:", user.pincode);
    const pharmacistsInArea = await User.find({
      userType: 'pharmacist',
      pincode: user.pincode
    });
    console.log("Found pharmacists:", pharmacistsInArea.length);

    // Create notifications for all pharmacists in the area
    if (pharmacistsInArea.length > 0) {
      console.log("Creating notifications for pharmacists...");
      const notifications = pharmacistsInArea.map(pharmacist => ({
        recipient: pharmacist._id,
        type: 'new_prescription',
        title: 'New Prescription Uploaded',
        message: `New prescription from ${user.name} in your area (Pincode: ${user.pincode}).`,
        prescriptionId: prescription._id,
        isRead: false
      }));

      await Notification.insertMany(notifications);
      console.log("Notifications created successfully");
    }

    console.log("=== PRESCRIPTION UPLOAD SUCCESSFUL ===");
    res.status(201).json({
      success: true,
      message: pharmacistsInArea.length > 0 
        ? `Prescription uploaded successfully. ${pharmacistsInArea.length} nearby pharmacist(s) have been notified.`
        : "Prescription uploaded successfully. No pharmacists found in your area yet.",
      prescription,
    });
  } catch (error) {
    console.error("=== PRESCRIPTION UPLOAD ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to upload prescription", 
      error: error.message 
    });
  }
});

// controllers/prescriptionController.js

exports.getAllPrescriptions = asyncHandler(async (req, res) => {
  const pharmacist = await User.findById(req.user._id);
  
  if (!pharmacist || !pharmacist.pincode) {
    return res.status(400).json({
      success: false,
      message: "Pharmacist pincode not found"
    });
  }

  // Use activatedAt if available, otherwise fall back to createdAt
  const joinDate = pharmacist.activatedAt || pharmacist.createdAt;

  const prescriptions = await Prescription.find({
    targetArea: pharmacist.pincode,
    createdAt: { $gte: joinDate } // Only show future prescriptions
  })
    .populate('userId', 'name email phone')
    .populate('assignedPharmacist', 'name pharmacyName')
    .sort({ createdAt: -1 });
  
  res.json({ 
    success: true,
    count: prescriptions.length,
    prescriptions,
    pharmacistJoinedAt: joinDate
  });
});

/* -------------------------- QUOTE PRESCRIPTION ---------------------------- */
exports.quotePrescription = asyncHandler(async (req, res) => {
  const { items, totalAmount, paymentMethod } = req.body;
  
  const rx = await Prescription.findById(req.params.id).populate('userId', 'name email phone');
  
  if (!rx) {
    return res.status(404).json({ 
      success: false,
      message: "Prescription not found" 
    });
  }

  if (rx.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Prescription already processed by another pharmacist",
    });
  }

  rx.items = items;
  rx.totalAmount = totalAmount;
  rx.paymentMethod = paymentMethod || rx.paymentMethod;
  rx.status = "quoted";
  rx.assignedPharmacist = req.user._id;

  await rx.save();

  // Create notification for customer
  await Notification.create({
    recipient: rx.userId._id,
    type: 'prescription_quoted',
    title: 'Price Quote Ready',
    message: `${req.user.pharmacyName || req.user.name} has quoted ₹${totalAmount.toFixed(2)} for your prescription.`,
    prescriptionId: rx._id,
    isRead: false
  });

  res.json({ 
    success: true,
    message: "Price quote submitted successfully", 
    prescription: rx 
  });
});

/* -------------------------- APPROVE PRESCRIPTION --------------------------- */
exports.approvePrescription = asyncHandler(async (req, res) => {
  const rx = await Prescription.findById(req.params.id).populate('userId', 'name email phone');
  
  if (!rx) {
    return res.status(404).json({ 
      success: false,
      message: "Prescription not found" 
    });
  }

  if (rx.status === "approved") {
    return res.status(400).json({
      success: false,
      message: "Prescription already accepted",
    });
  }

  if (rx.status !== "quoted") {
    return res.status(400).json({
      success: false,
      message: "Please quote prices first before approving",
    });
  }

  if (rx.assignedPharmacist.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only the pharmacist who quoted can approve",
    });
  }

  // Create order from prescription
  const order = await Order.create({
    user: rx.userId._id,
    pharmacy: req.user.pharmacyName || req.user.name,
    pharmacyId: req.user._id,
    address: rx.address,
    phone: rx.phone,
    items: rx.items,
    total: rx.totalAmount,
    paymentMethod: rx.paymentMethod,
    status: 'pending',
    prescriptionId: rx._id
  });

  rx.status = "approved";
  rx.orderId = order._id;
  await rx.save();

  // Create notification for customer
  await Notification.create({
    recipient: rx.userId._id,
    type: 'prescription_approved',
    title: 'Prescription Approved',
    message: `Your prescription has been approved by ${req.user.pharmacyName || req.user.name}. Order created successfully!`,
    prescriptionId: rx._id,
    orderId: order._id,
    isRead: false
  });

  res.json({ 
    success: true,
    message: "Prescription approved and order created", 
    prescription: rx,
    order
  });
});

/* -------------------------- REJECT PRESCRIPTION --------------------------- */
exports.rejectPrescription = asyncHandler(async (req, res) => {
  const { pharmacistNote } = req.body;
  
  const rx = await Prescription.findById(req.params.id);
  
  if (!rx) {
    return res.status(404).json({ 
      success: false,
      message: "Prescription not found" 
    });
  }

  rx.status = "rejected";
  rx.pharmacistNote = pharmacistNote || "Rejected by pharmacist";
  rx.assignedPharmacist = req.user._id;
  
  await rx.save();

  // Create notification for customer
  await Notification.create({
    recipient: rx.userId,
    type: 'prescription_rejected',
    title: 'Prescription Rejected',
    message: `Your prescription has been rejected. Reason: ${pharmacistNote || "Not specified"}`,
    prescriptionId: rx._id,
    isRead: false
  });

  res.json({ 
    success: true,
    message: "Prescription rejected", 
    prescription: rx 
  });
});

/* ---------------------- GET USER PRESCRIPTIONS ---------------------------- */
exports.getUserPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ 
    userId: req.params.userId 
  })
    .populate('assignedPharmacist', 'name pharmacyName phone')
    .sort({ createdAt: -1 });
  
  res.json({ 
    success: true,
    prescriptions 
  });
});