const Programme = require("../models/Programme");
const fs = require("fs");
const path = require("path");

// Add a new program
exports.addProgram = async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Image is required" 
            });
        }

        // Create the program with the image path
        const newProgram = new Programme({
            title,
            description,
            date,
            location,
            image: `/uploads/programs/${req.file.filename}`
        });

        await newProgram.save();

        res.status(201).json({
            success: true,
            message: "Program added successfully!",
            data: {
                ...newProgram._doc,
                image: `${req.protocol}://${req.get('host')}${newProgram.image}`
            }
        });
    } catch (error) {
        console.error("Error adding program:", error);
        
        // If there's an error, delete the uploaded file
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/programs', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: "Error adding program",
            error: error.message
        });
    }
};

// Fetch all programs
exports.getPrograms = async (req, res) => {
    try {
        const programs = await Programme.find().sort({ createdAt: -1 });

        // Map programs to include full image URLs
        const programsWithUrls = programs.map(program => ({
            ...program._doc,
            image: program.image ? `${req.protocol}://${req.get('host')}${program.image}` : null
          }));

        res.json({
            success: true,
            data: programsWithUrls
        });
    } catch (error) {
        console.error("Error fetching programs:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching programs",
            error: error.message
        });
    }
};

// Update a program

exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, location } = req.body;
        
        let updateData = {
            title,
            description,
            date,
            location
        };

        // If new image is uploaded
        if (req.file) {
            // Get the current program to delete old image
            const currentProgram = await Programme.findById(id);
            if (currentProgram?.image) {
                const oldImagePath = path.join(__dirname, '..', currentProgram.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            updateData.image = `/uploads/programs/${req.file.filename}`;
        }

        const updatedProgram = await Programme.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedProgram) {
            // If program wasn't found but file was uploaded, delete the new file
            if (req.file) {
                const newFilePath = path.join(__dirname, '../uploads/programs', req.file.filename);
                if (fs.existsSync(newFilePath)) {
                    fs.unlinkSync(newFilePath);
                }
            }
            return res.status(404).json({
                success: false,
                message: "Program not found"
            });
        }

        res.json({
            success: true,
            message: "Program updated successfully!",
            data: {
                ...updatedProgram._doc,
                image: updatedProgram.image ? 
                    `${req.protocol}://${req.get('host')}${updatedProgram.image}` : null
            }
        });
    } catch (error) {
        console.error("Error updating program:", error);
        
        // If there was an error and a file was uploaded, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/programs', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: "Error updating program",
            error: error.message
        });
    }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
    try {
        const program = await Programme.findById(req.params.id);
        
        if (!program) {
            return res.status(404).json({
                success: false,
                message: "Program not found"
            });
        }

        // Delete the associated image file
        if (program.image) {
            const imagePath = path.join(__dirname, '..', program.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Programme.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Program deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting program:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting program",
            error: error.message
        });
    }
};