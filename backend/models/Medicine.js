// backend/models/Medicine.js

const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        batch: {
            type: String,
            required: true,
            unique: true, // Batch number should be unique
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        reorderLevel: {
            type: Number,
            required: true,
            default: 10, // Minimum stock to trigger reorder warning
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0.01,
        },
        expiry: {
            type: Date, // Stored as a JavaScript Date object
            required: true,
        },
        // Reference to the pharmacist/user who owns this inventory (for multi-pharmacy support)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;