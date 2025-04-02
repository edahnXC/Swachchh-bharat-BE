const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const Volunteer = require("./models/Volunteer");
const Donor = require("./models/Donor");
const Pledge = require("./models/Pledge"); // Import Pledge model
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
// Update your CORS configuration in server.js
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, // This is important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// ✅ Fetch all volunteers
app.get("/api/admin/volunteers", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json({ success: true, data: volunteers });
  } catch (error) {
    console.error("❌ Error fetching volunteers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Fetch all donors
app.get("/api/admin/donors", async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json({ success: true, data: donors });
  } catch (error) {
    console.error("❌ Error fetching donors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Store new pledge
app.post("/api/pledge", async (req, res) => {
  try {
    const { name, email, city, pledges, date } = req.body;

    if (!name || !email || !city || !pledges.length) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newPledge = new Pledge({ name, email, city, pledges, date: date || new Date() });
    await newPledge.save();

    res.status(201).json({ success: true, message: "Pledge submitted successfully." });
  } catch (error) {
    console.error("❌ Error submitting pledge:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
