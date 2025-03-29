const express = require("express");
const Volunteer = require("../models/Volunteer"); // Ensure model is correct
const router = express.Router();

// POST - Add Volunteer
router.post("/", async (req, res) => {
    try {
      const { name, email, state, city, number, message } = req.body;
      const newVolunteer = new Volunteer({ name, email, state, city, number, message });
        await newVolunteer.save();
        res.status(201).json({ message: "Volunteer added successfully" });
    } catch (err) {
      if (err.code === 11000) { // Duplicate email error
          return res.status(400).json({ message: "Email already registered!" });
      }
      res.status(500).json({ error: err.message });
  }
});

// GET - Fetch All Volunteers
router.get("/", async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.status(200).json(volunteers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
