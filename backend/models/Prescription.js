// models/Prescription.js
const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    // Order-related fields
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        category: String
      }
    ],
    totalAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Insurance"],
      default: "Cash"
    },
    deliveryType: {
      type: String,
      enum: ["standard", "express"],
      default: "standard"
    },
    prescriptionType: {
      type: String,
      enum: ["acute", "chronic", "preventive"],
      default: "acute"
    },
    notes: {
      type: String,
      default: ""
    },
    // Pharmacist fields
    pharmacistNote: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Link to created order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);