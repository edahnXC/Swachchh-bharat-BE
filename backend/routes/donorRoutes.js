const express = require("express");
const { signupDonor, loginDonor, logoutDonor, verifyToken } = require("../controllers/donorController");
const Donor = require("../models/Donor");

const router = express.Router();

router.post("/signup", signupDonor);
router.post("/login", loginDonor);
router.post("/logout", logoutDonor);

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const donor = await Donor.findById(req.donorId).select("-password"); // Exclude password
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }
    res.json({ success: true, donor });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({ success: true, message: "Access granted", donorId: req.donorId });
});

module.exports = router;
