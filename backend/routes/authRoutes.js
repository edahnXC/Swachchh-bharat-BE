const express = require("express");
const { loginAdmin, verifyAdminToken } = require("../controllers/adminController");

const router = express.Router();

// Admin Login Route
router.post("/login", loginAdmin);

module.exports = router;
