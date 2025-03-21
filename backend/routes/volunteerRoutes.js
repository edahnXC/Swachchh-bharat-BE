const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");

// Create Volunteer
router.post("/", async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).json({ message: "Volunteer registered successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Volunteers
router.get("/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
