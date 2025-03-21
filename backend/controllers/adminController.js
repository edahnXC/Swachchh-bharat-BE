const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Programme = require("../models/Programme");

const adminUser = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD_HASH, // Pre-hashed password
};

//Admin Login Function
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (username !== adminUser.username) {
        return res.status(401).json({ success: false, message: "Invalid username" });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ success: true, token });
};

//Protected Routes
exports.getAdminDashboard = (req, res) => {
    res.json({ success: true, message: "Welcome to the Admin Dashboard!" });
};

exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching volunteers", error: error.message });
    }
};

exports.getDonors = async (req, res) => {
    try {
        const donors = await Donor.find();
        res.json({ success: true, data: donors });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching donors", error: error.message });
    }
};

exports.uploadProgramme = async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;
        if (!title || !description || !imageUrl) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newProgramme = new Programme({ title, description, imageUrl });
        await newProgramme.save();

        res.json({ success: true, message: "Programme uploaded successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error uploading programme", error: error.message });
    }
};

// Token Verification Middleware
exports.verifyAdminToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid token." });
    }
};
