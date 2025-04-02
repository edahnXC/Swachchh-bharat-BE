const express = require("express");
const {
    loginAdmin,
    verifyAdminToken,
    getVolunteers,
    getDonors,
    getContacts,
    getPledges,
    getAdminStats,
    getAdminProfile,
    updateAdminProfile
} = require("../controllers/adminController");
const { getPrograms, deleteProgram } = require("../controllers/programController");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Admin Login Route
router.post("/login", loginAdmin);

// Middleware to Verify Token - Updated to use verifyAdminToken from controller
router.use(verifyAdminToken);

// Profile Routes
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

// Protected Routes
router.get("/dashboard", (req, res) => {
    res.json({ success: true, message: "Welcome to the admin dashboard!" });
});

router.get("/stats", getAdminStats);
router.get("/volunteers", getVolunteers);
router.get("/donors", getDonors);
router.get("/contacts", getContacts);
router.get("/programs", getPrograms);
router.get("/pledges", getPledges);
router.delete("/programs/:id", deleteProgram);

// Multer configuration remains the same
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route to Add a New Program
router.post("/add-program", upload.single("image"), async (req, res) => {
    try {
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

// Other routes remain the same
router.delete("/volunteers/:id", async (req, res) => {
    try {
        await Volunteer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Volunteer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting volunteer" });
    }
});

router.delete("/donors/:id", async (req, res) => {
    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Donor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting donor" });
    }
});

router.delete("/contacts/:id", async (req, res) => {
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