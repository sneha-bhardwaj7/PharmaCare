const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests from your React app
app.use(express.json()); // Body parser

// Define API Routes
app.use('/api/auth', require('./routers/authRoutes'));
// Add other routes here (e.g., app.use('/api/pharmacy', require('./routes/pharmacyRoutes'));)

// Simple root route
app.get('/', (req, res) => res.send('PharmaCare API is running.'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));