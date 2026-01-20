// backend/models/Order.js

const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pharmacy: {
      type: String,
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled", "delivered"],
      default: "pending",
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        category: String
      },
    ],
    total: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Insurance"],
      default: "Cash"
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    }
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);