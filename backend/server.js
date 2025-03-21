const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donorRoutes = require("./routes/donorRoutes");
const contactRoutes = require("./routes/contactRoutes");
const pledgeRoutes = require("./routes/pledgeRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/pledge", pledgeRoutes);

// Default Route
app.get("/", (req, res) => res.json({ success: true, message: "Welcome to Clean India Mission API 🚀" }));

// 404 Handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
