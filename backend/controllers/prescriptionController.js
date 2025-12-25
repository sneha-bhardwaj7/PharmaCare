const Prescription = require("../models/Prescription");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");

/* -------------------------- UPLOAD PRESCRIPTION --------------------------- */
exports.uploadPrescription = asyncHandler(async (req, res) => {
  const { patientName, phone, address } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  // Upload to Cloudinary using buffer stream
  const uploadCloud = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "prescriptions",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });
  };

  const cloudFile = await uploadCloud();

  const prescription = await Prescription.create({
    userId: req.user._id,
    imageUrl: cloudFile.secure_url,  // CLOUD URL
    patientName,
    phone,
    address,
  });

  res.status(201).json({
    message: "Prescription uploaded successfully",
    prescription,
  });
});

/* -------------------------- GET ALL PRESCRIPTIONS ------------------------- */
exports.getAllPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find().sort({ createdAt: -1 });
  res.json({ prescriptions });
});

/* -------------------------- APPROVE PRESCRIPTION -------------------------- */
exports.approvePrescription = asyncHandler(async (req, res) => {
  const rx = await Prescription.findById(req.params.id);

  if (!rx) return res.status(404).json({ message: "Prescription not found" });

  rx.status = "approved";
  await rx.save();

  res.json({ message: "Prescription approved", prescription: rx });
});

/* -------------------------- REJECT PRESCRIPTION --------------------------- */
exports.rejectPrescription = asyncHandler(async (req, res) => {
  const { pharmacistNote } = req.body;
  const rx = await Prescription.findById(req.params.id);

  if (!rx) return res.status(404).json({ message: "Prescription not found" });

  rx.status = "rejected";
  rx.pharmacistNote = pharmacistNote || "Rejected by pharmacist";
  await rx.save();

  res.json({ message: "Prescription rejected", prescription: rx });
});

/* ---------------------- GET USER PRESCRIPTIONS ---------------------------- */
exports.getUserPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ userId: req.params.userId })
    .sort({ createdAt: -1 });

  res.json({ prescriptions });
});
