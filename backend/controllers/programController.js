const Programme = require("../models/Programme");

// Add a new program
exports.addProgram = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }
        const image = req.file.filename;

        const newProgram = new Programme({ title, description, image });
        await newProgram.save();
        
        res.json({ success: true, message: "Program added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding program", error: error.message });
    }
};

// Fetch all programs
exports.getPrograms = async (req, res) => {
    try {
        const programs = await Programme.find();

        const formattedPrograms = programs.map(program => ({
            ...program._doc,
            image: program.image ? `http://localhost:5000/uploads/${program.image}` : null
        }));

        res.json({ success: true, data: formattedPrograms });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching programs", error: error.message });
    }
};


// Delete a program
exports.deleteProgram = async (req, res) => {
    try {
        await Programme.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Program deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting program", error: error.message });
    }
};
