const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'https://delightful-strudel-9135b2.netlify.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donorRoutes = require("./routes/donorRoutes");
const contactRoutes = require("./routes/contactRoutes");
const pledgeRoutes = require("./routes/pledgeRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const publicRoutes = require("./routes/publicRoutes"); 

// Public Routes
app.get("/api/config/razorpay", (req, res) => {
  res.json({ 
    key: process.env.RAZORPAY_KEY_ID 
  });
});

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/pledge", pledgeRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/public", publicRoutes);

// Default Route
app.get("/", (req, res) => res.json({ 
  success: true, 
  message: "Welcome to Clean India Mission API 🚀" 
}));

// 404 Handler
app.use((req, res) => res.status(404).json({ 
  success: false, 
  message: "Route not found" 
}));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));