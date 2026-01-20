require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const inventoryRoutes = require('./routers/inventoryRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const prescriptionRoutes = require("./routers/prescriptionRoutes");
const orderRoutes = require("./routers/orderRoutes");
const notificationRoutes = require("./routers/notificationRoutes");
const analyticsRoutes = require("./routers/analyticsRoutes");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'https://pharma-care-pcc8.vercel.app'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'PharmaCare API is running' });
});

// Prescription Routes
app.use("/uploads", express.static("uploads"));

// Add this with your other route registrations
app.use("/api/analytics", analyticsRoutes);


// Error Handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});