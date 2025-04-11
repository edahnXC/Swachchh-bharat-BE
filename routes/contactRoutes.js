const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// Create Contact Message
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Messages
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
