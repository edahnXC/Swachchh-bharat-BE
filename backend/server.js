require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const fs = require('fs');

// Initialize Express
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://swachhbharattt.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Static files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/pledge', require('./routes/pledgeRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// Razorpay Config Endpoint
app.get('/api/config/razorpay', (req, res) => {
  res.json({ 
    key: process.env.RAZORPAY_KEY_ID,
    currency: 'INR',
    name: 'Clean India Mission'
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

// Home Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "🚀 Clean India Mission API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    database: "Connected to MongoDB Atlas",
    frontend: process.env.CLIENT_URL
  });
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  🔗 Frontend: ${process.env.CLIENT_URL}
  ⏰ Started at: ${new Date().toLocaleString()}
  `);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;