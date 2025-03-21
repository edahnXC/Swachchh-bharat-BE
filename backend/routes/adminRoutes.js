const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const router = express.Router();

// Read admin credentials from .env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Ensure environment variables are set
if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    console.error("❌ Error: Admin credentials not found in .env file");
    process.exit(1);
}

// Admin Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username matches
        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({ success: false, message: "Invalid username" });
        }

        // Compare hashed password from .env
        const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Middleware to Verify Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Protected Route Example (Admin Dashboard)
router.get("/dashboard", verifyToken, (req, res) => {
    res.json({ success: true, message: "Welcome to the admin dashboard!" });
});

module.exports = router;
