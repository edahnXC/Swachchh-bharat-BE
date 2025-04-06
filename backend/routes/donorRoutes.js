const express = require("express");
const { createDonation, verifyPayment } = require("../controllers/donorController");

const router = express.Router();

// Donation routes
router.post("/donate", createDonation);
router.post("/verify-payment", verifyPayment);

module.exports = router;