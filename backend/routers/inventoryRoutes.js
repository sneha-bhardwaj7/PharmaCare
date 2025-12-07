// backend/routes/inventoryRoutes.js

const express = require('express');
const router = express.Router();
const {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware'); // ASSUMED AUTH MIDDLEWARE

// Base route: /api/inventory


const { getAlerts } = require('../controllers/inventoryController');

router.get('/alerts', protect, getAlerts);


router.route('/')
    .get(protect, getMedicines)   // GET all inventory items
    .post(protect, addMedicine);  // POST to add a new item

router.route('/:id')
    .put(protect, updateMedicine) // PUT to update a specific item
    .delete(protect, deleteMedicine); // DELETE a specific item

module.exports = router;