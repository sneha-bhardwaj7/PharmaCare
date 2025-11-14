require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const inventoryRoutes = require('./routers/inventoryRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Server: app.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pharma-care-pcc8.vercel.app' // Corrected syntax and removed trailing slash
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'PharmaCare API is running' });
});

// Error Handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});