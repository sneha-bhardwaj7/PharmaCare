const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { onlyPharmacist } = require("../middleware/roleMiddleware");
const { getPharmacistAnalytics } = require("../controllers/analyticsController");

// Get analytics data (pharmacist only)
router.get("/pharmacist", protect, onlyPharmacist, getPharmacistAnalytics);

module.exports = router;