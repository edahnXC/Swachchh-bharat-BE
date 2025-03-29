const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const multer = require("multer");
const Program = require("../models/Programme"); // Import the Program model
const {
    loginAdmin,
    verifyAdminToken,
    getVolunteers,
    getDonors,
    getContacts,
    getPledges,
    getAdminStats,
} = require("../controllers/adminController");
const { getPrograms, deleteProgram } = require("../controllers/programController");
const path=require('path');
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Contact = require("../models/Contact");

dotenv.config();

const router = express.Router();

// Admin Login Route
router.post("/login", loginAdmin);

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

// Protected Routes
router.get("/dashboard", verifyToken, (req, res) => {
    res.json({ success: true, message: "Welcome to the admin dashboard!" });
});

router.get("/stats", verifyAdminToken, getAdminStats);
router.get("/volunteers", verifyAdminToken, getVolunteers);
router.get("/donors", verifyAdminToken, getDonors);
router.get("/contacts", verifyAdminToken, getContacts);
router.get("/programs", verifyToken, getPrograms);
router.get("/pledges", verifyToken, getPledges);
router.delete("/programs/:id", verifyToken, deleteProgram);

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads/');
      cb(null, uploadPath); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
  });

const upload = multer({ storage: storage });

// ✅ Route to Add a New Program
router.post("/add-program", verifyToken, upload.single("image"), async (req, res) => {
    try {
        console.log("File Data:", req.file); // Debugging file upload
        console.log("Request Body:", req.body);

        const { title, description } = req.body;
        const imagePath = req.file ? req.file.filename : null;

        if (!title || !description || !imagePath) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const newProgram = new Program({
            title,
            description,
            image: imagePath,
        });

        await newProgram.save();
        res.json({ success: true, message: "Program added successfully!" });

    } catch (error) {
        console.error("Error adding program:", error);
        res.status(500).json({ success: false, message: "Error adding program" });
    }
});

router.delete("/volunteers/:id", verifyToken, async (req, res) => {
    try {
        await Volunteer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Volunteer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting volunteer" });
    }
});

router.delete("/donors/:id", verifyToken, async (req, res) => {
    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Donor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting donor" });
    }
});

router.delete("/contacts/:id", verifyToken, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Contact message deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting contact message" });
    }
});

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
    }
    res.json({ message: "File uploaded successfully!", filePath: `/uploads/${req.file.filename}` });
});

module.exports = router;
