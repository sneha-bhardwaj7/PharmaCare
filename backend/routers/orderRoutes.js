const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { placeOrder, getMyOrders, getAllOrders } = require("../controllers/orderController");

// Place order
router.post("/", protect, placeOrder);

// Fetch logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

// Fetch all orders (admin/staff only)
router.get("/", protect, getAllOrders);

module.exports = router;