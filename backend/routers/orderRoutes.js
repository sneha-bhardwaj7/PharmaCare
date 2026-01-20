// backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { onlyPharmacist } = require("../middleware/roleMiddleware");
const { 
  placeOrder, 
  getMyOrders, 
  getPharmacistOrders,
  getAllOrders,
  updateOrderStatus 
} = require("../controllers/orderController");

// Place order (customers)
router.post("/", protect, placeOrder);

// Get my orders (customer view)
router.get("/my-orders", protect, getMyOrders);

// Get pharmacist orders (pharmacist view)
router.get("/pharmacist-orders", protect, onlyPharmacist, getPharmacistOrders);

// Update order status (pharmacist only)
router.put("/:id/status", protect, onlyPharmacist, updateOrderStatus);

// Get all orders (admin only)
router.get("/", protect, getAllOrders);

module.exports = router;