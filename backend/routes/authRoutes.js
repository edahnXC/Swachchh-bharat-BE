const express = require("express");
const { loginAdmin } = require("../controllers/adminController");
const router = express.Router();

// @desc    Authenticate admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginAdmin);

module.exports = router;