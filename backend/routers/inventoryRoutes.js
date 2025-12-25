const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getLowStockMedicines,
  getExpiringSoonMedicines,
  getAlerts,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/inventoryController");

// Dashboard alert aggregation
router.get("/alerts", protect, getAlerts);

// New Required Endpoints
router.get("/low-stock", protect, getLowStockMedicines);
router.get("/expiring-soon", protect, getExpiringSoonMedicines);

// Inventory CRUD
router.route("/")
  .get(protect, getMedicines)
  .post(protect, addMedicine);

router.route("/:id")
  .put(protect, updateMedicine)
  .delete(protect, deleteMedicine);

module.exports = router;
