// backend/routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require("../controllers/notificationController");

// Get all notifications for logged-in user
router.get("/", protect, getMyNotifications);

// Get unread count
router.get("/unread-count", protect, getUnreadCount);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);

// Mark all as read
router.put("/mark-all-read", protect, markAllAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;