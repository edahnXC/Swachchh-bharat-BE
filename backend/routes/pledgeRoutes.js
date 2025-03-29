const express = require("express");
const Pledge = require("../models/Pledge"); // Import Pledge model
const router = express.Router();

// ✅ Route to handle pledge submission
router.post("/pledge", async (req, res) => {
  try {
    const { name, email, city, pledges } = req.body;

    // Validate required fields
    if (!name || !email || !city || !pledges || pledges.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user has already made a pledge
    const existingPledge = await Pledge.findOne({ email });
    if (existingPledge) {
      return res.status(409).json({ error: "You have already submitted a pledge." });
    }

    // Save the new pledge
    const newPledge = new Pledge({ name, email, city, pledges });
    await newPledge.save();

    res.status(201).json({ success: true, message: "Pledge submitted successfully!" });
  } catch (error) {
    console.error("❌ Error saving pledge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Route to get all pledges (optional)
router.get("/pledges", async (req, res) => {
  try {
    const pledges = await Pledge.find();
    res.status(200).json({ success: true, data: pledges });
  } catch (error) {
    console.error("❌ Error fetching pledges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
