require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

// Initialize Express
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://swachhbharattt.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donorRoutes = require("./routes/donorRoutes");
const contactRoutes = require("./routes/contactRoutes");
const pledgeRoutes = require("./routes/pledgeRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const publicRoutes = require("./routes/publicRoutes");

// Public Razorpay Config Endpoint
app.get("/api/config/razorpay", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/pledge", pledgeRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/public", publicRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Clean India Mission API is running",
    database: "Connected to MongoDB Atlas",
    frontend: process.env.CLIENT_URL,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}\n🔗 Frontend: ${process.env.CLIENT_URL}`)
);