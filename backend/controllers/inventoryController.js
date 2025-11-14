// backend/controllers/inventoryController.js

const asyncHandler = require("express-async-handler");
const Medicine = require("../models/Medicine");

/* ---------------------------------------------------------
   @desc    Get all medicines for the authenticated pharmacist
   @route   GET /api/inventory
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const getMedicines = asyncHandler(async (req, res) => {
    // 1. Fetch only the medicines belonging to the logged-in user (pharmacist)
    const medicines = await Medicine.find({ user: req.user._id });

    res.status(200).json(medicines);
});

/* ---------------------------------------------------------
   @desc    Add a new medicine item to inventory
   @route   POST /api/inventory
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const addMedicine = asyncHandler(async (req, res) => {
    const { name, batch, category, stock, reorderLevel, price, expiry } = req.body;

    if (!name || !batch || !category || !stock || !price || !expiry) {
        res.status(400);
        throw new Error("Please fill all required fields.");
    }

    // 2. Check if a medicine with the same batch number already exists for this user
    const medicineExists = await Medicine.findOne({ batch, user: req.user._id });

    if (medicineExists) {
        res.status(400);
        throw new Error("Medicine with this Batch number already exists.");
    }

    // 3. Create the new medicine item
    const medicine = await Medicine.create({
        name,
        batch,
        category,
        stock,
        reorderLevel: reorderLevel || 10, // Use default if not provided
        price,
        expiry: new Date(expiry), // Ensure expiry is stored as a Date object
        user: req.user._id, // Associate the item with the logged-in user
    });

    res.status(201).json(medicine);
});

/* ---------------------------------------------------------
   @desc    Update an existing medicine item
   @route   PUT /api/inventory/:id
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const updateMedicine = asyncHandler(async (req, res) => {
    const { name, batch, category, stock, reorderLevel, price, expiry } = req.body;
    const medicineId = req.params.id;

    let medicine = await Medicine.findById(medicineId);

    if (!medicine) {
        res.status(404);
        throw new Error("Medicine not found.");
    }

    // 4. Security Check: Ensure the logged-in user owns this medicine item
    if (medicine.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to update this item.");
    }

    // 5. Update fields (using spread operator to handle undefined fields gracefully)
    const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicineId,
        {
            name: name || medicine.name,
            batch: batch || medicine.batch,
            category: category || medicine.category,
            stock: stock !== undefined ? stock : medicine.stock,
            reorderLevel: reorderLevel !== undefined ? reorderLevel : medicine.reorderLevel,
            price: price || medicine.price,
            expiry: expiry ? new Date(expiry) : medicine.expiry,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedMedicine);
});

/* ---------------------------------------------------------
   @desc    Delete a medicine item
   @route   DELETE /api/inventory/:id
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error("Medicine not found.");
    }

    // 6. Security Check: Ensure the logged-in user owns this medicine item
    if (medicine.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to delete this item.");
    }

    await medicine.deleteOne();

    res.status(200).json({ message: "Medicine removed successfully." });
});

module.exports = {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
};