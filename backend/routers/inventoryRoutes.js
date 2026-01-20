const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchMedicine } = require("../controllers/medicineController");
const {
  getLowStockMedicines,
  getExpiringSoonMedicines,
  getAlerts,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/inventoryController");

// ⚠️ CRITICAL: Specific routes MUST come BEFORE parameterized routes!

// Dashboard alerts
router.get("/alerts", protect, getAlerts);
router.get("/low-stock", protect, getLowStockMedicines);
router.get("/expiring-soon", protect, getExpiringSoonMedicines);

// 🔥 SEARCH MUST BE BEFORE /:id
router.get("/search", protect, searchMedicine);

// Base inventory routes
router.route("/")
  .get(protect, getMedicines)
  .post(protect, addMedicine);

// Parameterized routes LAST
router.route("/:id")
  .put(protect, updateMedicine)
  .delete(protect, deleteMedicine);

module.exports = router;