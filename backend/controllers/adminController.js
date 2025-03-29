const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Contact = require("../models/Contact");
const Programme = require("../models/Programme");
const Pledge=require("../models/Pledge");

const adminUser = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD_HASH, // Pre-hashed password
};

// Admin Login Function
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    if (username !== adminUser.username) {
        console.log("Invalid username:", username);
        return res.status(401).json({ success: false, message: "Invalid username" });
    }

    console.log("Stored password hash:", adminUser.password);
    const isMatch = await bcrypt.compare(password, adminUser.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ success: true, token });
};

// Protected Routes
exports.getAdminDashboard = (req, res) => {
    res.json({ success: true, message: "Welcome to the Admin Dashboard!" });
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching contacts", error: error.message });
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching volunteers", error: error.message });
    }
};
exports.getPledges = async (req, res) => {
    try {
        const pledges = await Pledge.find(); 
        res.json({ success: true, data: pledges });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pledges", error: error.message });
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

exports.getAdminStats = async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const totalVolunteers = await Volunteer.countDocuments();
        const totalPrograms = await Programme.countDocuments();
        const totalPledges=await Pledge.countDocuments();
        res.json({
            totalDonors,
            totalVolunteers,
            totalPrograms,
            totalPledges,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching admin stats" });
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
