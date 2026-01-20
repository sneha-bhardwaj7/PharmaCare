// backend/controllers/orderController.js

const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Place order
const placeOrder = asyncHandler(async (req, res) => {
  const { items, total, pharmacy, pharmacyId, address, phone, paymentMethod } = req.body;
  
  if (!items || items.length === 0 || !pharmacy || !address || !phone) {
    res.status(400);
    throw new Error("Missing order details");
  }

  if (!pharmacyId) {
    res.status(400);
    throw new Error("Pharmacy ID is required");
  }

  const order = await Order.create({
    user: req.user._id,
    pharmacy,
    pharmacyId,
    address,
    phone,
    items,
    total,
    paymentMethod: paymentMethod || 'Cash',
    status: 'pending'
  });

  // Populate user details
  await order.populate('user', 'name email phone');
  await order.populate('pharmacyId', 'name pharmacyName address phone');
  // Create notification for pharmacist
  await Notification.create({
    recipient: pharmacyId,
    type: 'new_order',
    title: 'New Order Received',
    message: `New order from ${req.user.name} for ${items.length} item(s). Total: ₹${total}`,
    orderId: order._id,
    isRead: false
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order
  });
});

// Get my orders (customer view)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('user', 'name email phone')
    .populate('pharmacyId', 'name pharmacyName address phone')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    orders
  });
});

// Get all orders for a pharmacist
const getPharmacistOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ pharmacyId: req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    orders
  });
});

// Get all orders (admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email phone')
    .populate('pharmacyId', 'name pharmacyName')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    orders
  });
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if pharmacist owns this order
  if (order.pharmacyId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this order");
  }

  order.status = status;
  await order.save();

  // Create notification for customer
  const statusMessages = {
    processing: "Your order is being processed",
    completed: "Your order has been completed",
    delivered: "Your order has been delivered",
    cancelled: "Your order has been cancelled"
  };

  await Notification.create({
    recipient: order.user,
    type: 'order_update',
    title: 'Order Status Updated',
    message: statusMessages[status] || `Order status changed to ${status}`,
    orderId: order._id,
    isRead: false
  });

  await order.populate('user', 'name email phone');

  res.json({
    success: true,
    message: "Order status updated",
    order
  });
});

module.exports = { 
  placeOrder, 
  getMyOrders, 
  getPharmacistOrders,
  getAllOrders,
  updateOrderStatus 
};