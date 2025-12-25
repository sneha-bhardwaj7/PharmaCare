const express = require("express");
const router = express.Router();

const {
  uploadPrescription,
  getAllPrescriptions,
  approvePrescription,
  rejectPrescription,
  getUserPrescriptions,
} = require("../controllers/prescriptionController");

const { protect } = require("../middleware/authMiddleware");
const { onlyPharmacist } = require("../middleware/roleMiddleware");

// NEW: Cloud upload middleware (stores file in memory, not local disk)
const upload = require("../middleware/uploadMiddleware");

/* --------------------- ROUTES --------------------------- */

// USER: Upload Prescription
router.post(
  "/upload",
  protect,
  upload.single("prescriptionImage"),
  uploadPrescription
);

// PHARMACIST: Get all prescriptions
router.get("/all", protect, onlyPharmacist, getAllPrescriptions);

// PHARMACIST: Approve prescription
router.put("/approve/:id", protect, onlyPharmacist, approvePrescription);

// PHARMACIST: Reject prescription
router.put("/reject/:id", protect, onlyPharmacist, rejectPrescription);

// USER: Get their own prescriptions
router.get("/user/:userId", protect, getUserPrescriptions);

module.exports = router;
