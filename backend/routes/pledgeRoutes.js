const express = require("express");
const Pledge = require("../models/Pledge"); // Import Pledge model
const router = express.Router();

router.post("/pledge", async (req, res) => {
  try {
    const { name, email, city, pledges } = req.body;

    if (!name || !email || !city || pledges.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPledge = new Pledge({ name, email, city, pledges });
    await newPledge.save();
    
    res.status(201).json({ message: "Pledge taken successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving pledge" });
  }
});

module.exports = router;
