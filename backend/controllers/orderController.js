const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");

// Place order
const placeOrder = asyncHandler(async (req, res) => {
  const { items, total, pharmacy, address, paymentMethod } = req.body;
  
  if (!items || items.length === 0 || !pharmacy || !address) {
    res.status(400);
    throw new Error("Missing order details");
  }

  const order = await Order.create({
    user: req.user._id,
    pharmacy,
    address,
    items,
    total,
    paymentMethod: paymentMethod || 'Cash',
    status: 'pending'
  });

  // Populate user details before sending response
  await order.populate('user', 'name email phone');
  
  res.status(201).json(order);
});

// Get my orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  
  res.json(orders);
});

// Get all orders (admin only - add this new endpoint)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  
  res.json(orders);
});

module.exports = { placeOrder, getMyOrders, getAllOrders };