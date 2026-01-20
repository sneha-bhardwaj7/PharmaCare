// backend/controllers/notificationController.js

const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// Get all notifications for logged-in user
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('orderId', 'status total pharmacy')
    .populate('prescriptionId', 'status patientName')
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.json({
    success: true,
    notifications,
    unreadCount
  });
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: "Notification marked as read",
    notification
  });
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: "All notifications marked as read"
  });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: "Notification deleted"
  });
});

// Get unread count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.json({
    success: true,
    unreadCount: count
  });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};