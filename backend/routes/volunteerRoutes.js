const express = require("express");
const Volunteer = require("../models/Volunteer");
const router = express.Router();

// Create a new volunteer
router.post("/", async (req, res) => {
    try {
        const { name, email, country, state, city, number, message } = req.body;
        
        if (!name || !email || !country || !state || !city || !number) {
            return res.status(400).json({ 
                success: false,
                error: "All required fields must be filled" 
            });
        }

        const newVolunteer = new Volunteer({ 
            name, 
            email, 
            country, 
            state, 
            city, 
            number, 
            message 
        });
        
        await newVolunteer.save();
        
        res.status(201).json({ 
            success: true,
            message: "Volunteer added successfully",
            data: await newVolunteer.populate('country state', 'name')
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                error: "Email already registered!" 
            });
        }
        res.status(500).json({ 
            success: false,
            error: "Server error: " + err.message 
        });
    }
});

// Get all volunteers
router.get("/", async (req, res) => {
    try {
        const volunteers = await Volunteer.find()
            .populate('country', 'name')
            .populate('state', 'name');
            
        res.status(200).json({ 
            success: true, 
            data: volunteers 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Server error: " + err.message 
        });
    }
});

// Get single volunteer
router.get("/:id", async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id)
            .populate('country', 'name')
            .populate('state', 'name');
            
        if (!volunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            data: volunteer 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Server error: " + err.message 
        });
    }
});

// Update volunteer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, country, state, city, number, message } = req.body;
        
        const updatedVolunteer = await Volunteer.findByIdAndUpdate(
            id,
            { name, email, country, state, city, number, message },
            { new: true, runValidators: true }
        ).populate('country', 'name').populate('state', 'name');
        
        if (!updatedVolunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "Volunteer updated successfully",
            data: updatedVolunteer
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                error: "Email already registered!" 
            });
        }
        res.status(500).json({ 
            success: false,
            error: "Server error: " + err.message 
        });
    }
});

// Delete volunteer
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVolunteer = await Volunteer.findByIdAndDelete(id);
        
        if (!deletedVolunteer) {
            return res.status(404).json({ 
                success: false,
                error: "Volunteer not found" 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "Volunteer deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: "Server error: " + err.message 
        });
    }
});

module.exports = router;