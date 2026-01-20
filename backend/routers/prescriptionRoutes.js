// routes/prescriptionRoutes.js

const express = require("express");
const router = express.Router();
const {
  uploadPrescription,
  getAllPrescriptions,
  quotePrescription,      // ✅ ADD THIS
  approvePrescription,
  rejectPrescription,
  getUserPrescriptions,
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/authMiddleware");
const { onlyPharmacist } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* --------------------- ROUTES --------------------------- */
router.post("/upload", protect, upload.single("prescriptionImage"), uploadPrescription);
router.get("/all", protect, onlyPharmacist, getAllPrescriptions);
router.put("/quote/:id", protect, onlyPharmacist, quotePrescription);  // ✅ ADD THIS
router.put("/approve/:id", protect, onlyPharmacist, approvePrescription);
router.put("/reject/:id", protect, onlyPharmacist, rejectPrescription);
router.get("/user/:userId", protect, getUserPrescriptions);

module.exports = router;