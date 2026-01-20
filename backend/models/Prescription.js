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
    assignedPharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetArea: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { 
          type: String, 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true 
        },
        price: { 
          type: Number, 
          required: false,  // ✅ CHANGED: Not required on upload
          default: 0        // ✅ ADDED: Default to 0
        },
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
    pharmacistNote: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "quoted", "approved", "rejected"],  // ✅ Added "quoted"
      default: "pending",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    }
  },
  { timestamps: true }
);


prescriptionSchema.index({ targetArea: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);