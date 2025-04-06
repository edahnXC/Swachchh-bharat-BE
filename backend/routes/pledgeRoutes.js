const express = require("express");
const Pledge = require("../models/Pledge");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, country, state, city, pledges } = req.body;

    if (!name || !email || !country || !state || !city || !pledges || pledges.length === 0) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingPledge = await Pledge.findOne({ email });
    if (existingPledge) {
      return res.status(409).json({ error: "You have already submitted a pledge." });
    }

    const newPledge = new Pledge({ 
      name, 
      email, 
      country, 
      state, 
      city, 
      pledges 
    });
    
    await newPledge.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Pledge submitted successfully!",
      data: newPledge
    });
  } catch (error) {
    console.error("Error saving pledge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const pledges = await Pledge.find()
      .populate('country', 'name')
      .populate('state', 'name');
    res.status(200).json({ success: true, data: pledges });
  } catch (error) {
    console.error("Error fetching pledges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;