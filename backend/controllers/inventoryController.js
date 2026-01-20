// backend/controllers/inventoryController.js

const asyncHandler = require("express-async-handler");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

/* ---------------------------------------------------------
   @desc    Get Low Stock & Expiry Alerts
   @route   GET /api/inventory/alerts
   @access  Private (Pharmacist only)
--------------------------------------------------------- */

// Utility function (days until expiry)
const daysUntilExpiry = (expiry) => {
  const today = new Date();
  return Math.ceil((new Date(expiry) - today) / (1000 * 60 * 60 * 24));
};

// --- Get Low Stock Medicines ---
const getLowStockMedicines = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const lowStock = await Medicine.find({
    user: userId,
    $or: [
      { stock: { $lte: 0 } },
      { $expr: { $lte: ["$stock", "$reorderLevel"] } }
    ]
  }).sort({ stock: 1 });

  res.json(lowStock);
});



// --- Get Expiring Soon Medicines ---
const getExpiringSoonMedicines = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(thresholdDate.getDate() + 30);

  const expiringSoon = await Medicine.find({
    user: userId,
    expiry: { $lte: thresholdDate, $gte: today }
  }).sort({ expiry: 1 });

  const formatted = expiringSoon.map(m => ({
    ...m._doc,
    daysLeft: daysUntilExpiry(m.expiry)
  }));

  res.json(formatted);
});

// --- Dashboard Alert Aggregator ---
const getAlerts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + 30);

  const allMedicines = await Medicine.find({ user: userId });

  const lowStock = [];
  const expiringSoon = [];
  const expired = [];

  allMedicines.forEach(med => {
    const daysLeft = daysUntilExpiry(med.expiry);

    if (med.stock <= 0 || med.stock <= med.reorderLevel) {
      lowStock.push(med);
    }

    if (daysLeft < 0) {
      expired.push(med);
    } else if (daysLeft <= 30) {
      expiringSoon.push({ ...med._doc, daysLeft });
    }
  });

  res.json({ lowStock, expiringSoon, expired });
});

const getMedicines = asyncHandler(async (req, res) => {
    // 1. Fetch only the medicines belonging to the logged-in user (pharmacist)
    const medicines = await Medicine.find({ user: req.user._id });

    res.status(200).json(medicines);
});

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


// Search for medicine and find pharmacists who have it in the same pincode
exports.searchMedicine = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const userPincode = req.user.pincode;

  // if (!userPincode) {
  //   return res.status(400).json({
  //     message: "User pincode not found. Please update your profile with pincode.",
  //   });
  // }

  // if (!name) {
  //   return res.status(400).json({
  //     message: "Please provide a medicine name to search.",
  //   });
  // }

  if (!name || !userPincode) {
    return res.status(400).json({ message: "Medicine name & pincode required" });
  }

  try {
    // Find all medicines matching the search term (case-insensitive, partial match)
    const medicines = await Medicine.find({
    name: { $regex: name, $options: "i" },
    stock: { $gt: 0 },
    expiry: { $gte: new Date() }
  }).populate({
    path: "user",
    match: {
      pincode: userPincode,
      userType: "pharmacist",
      isAvailable: true
    },
    select: "name phone pharmacyName address rating licenseNumber"
  });

    // Filter out medicines where user/pharmacist is null (different pincode or not a pharmacist)
    const availableMedicines = medicines.filter(med => med.user !== null);

    // Format the response with complete pharmacist and medicine details
    const results = medicines
    .filter(m => m.user)
    .map(m => ({
      medicineId: m._id,
      medicineName: m.name,
      category: m.category,
      price: m.price,
      stock: m.stock,
      expiry: m.expiry,
      pharmacistId: m.user._id,
      pharmacyName: m.user.pharmacyName,
      pharmacistPhone: m.user.phone,
      pharmacyAddress: m.user.address,
      rating: m.user.rating || 4.5,
      licenseNumber: m.user.licenseNumber
    }));

    res.json({
      success: true,
      count: pharmacists.length,
      searchTerm: name,
      userPincode: userPincode,
      pharmacists
    });
  } catch (error) {
    console.error("Medicine search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search medicine",
      error: error.message
    });
  }
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
     getLowStockMedicines,
    getExpiringSoonMedicines,
    getAlerts,
};