const asyncHandler = require("express-async-handler");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

exports.searchMedicine = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const userPincode = req.user?.pincode;

  if (!userPincode) {
    return res.status(400).json({
      success: false,
      message: "Please add your pincode in profile settings to search for medicines in your area.",
    });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Please provide a medicine name to search.",
    });
  }

  try {
    // Step 1: Fetch medicines
    const allMedicines = await Medicine.find({
      name: { $regex: name.trim(), $options: 'i' },
      stock: { $gt: 0 }
    }).populate('user');

    // Step 2: Filter valid medicines by pharmacist and pincode
    const availableMedicines = allMedicines.filter(med => {
      if (!med.user) return false;
      if (med.user.userType !== 'pharmacist') return false;
      return med.user.pincode === userPincode;
    });

    // Step 3: Format response
    const pharmacists = availableMedicines.map(med => ({
      medicineId: med._id,
      medicineName: med.name,
      category: med.category,
      price: med.price,
      stock: med.stock,
      batch: med.batch,
      expiry: med.expiry,
      pharmacistId: med.user._id,
      pharmacistName: med.user.name,
      pharmacistPhone: med.user.phone,
      pharmacistEmail: med.user.email,
      pharmacyName: med.user.pharmacyName || 'Pharmacy',
      pharmacyAddress: med.user.address,
      pincode: med.user.pincode,
      licenseNumber: med.user.licenseNumber || 'N/A',
      rating: med.user.rating || 4.5,
      isAvailable: med.user.isAvailable !== false
    }));

    res.json({
      success: true,
      count: pharmacists.length,
      searchTerm: name.trim(),
      userPincode: userPincode,
      pharmacists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search medicine",
      error: error.message
    });
  }
});
