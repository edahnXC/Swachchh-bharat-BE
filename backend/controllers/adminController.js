const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Contact = require("../models/Contact");
const Programme = require("../models/Programme");
const Pledge = require("../models/Pledge");

// Admin Login Function
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find admin by username (case insensitive)
        const admin = await Admin.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') } 
        });
        
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Create token with admin ID and basic info
        const token = jwt.sign(
            { 
                id: admin._id,
                username: admin.username,
                role: 'admin' // Add role for clarity
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" }
        );

        // Return token in both cookie and response body
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.status(200).json({ 
            success: true, 
            token, // Also send token in response
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
};

// Token Verification Middleware (updated)
exports.verifyAdminToken = (req, res, next) => {
    // Get token from header, cookie, or body
    let token = req.headers.authorization?.split(" ")[1] || 
                req.cookies?.adminToken || 
                req.body?.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Access denied. No token provided." 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify this is an admin token
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not an admin token."
            });
        }
        
        // Attach the decoded admin data to the request
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Invalid or expired token." 
        });
    }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
    try {
        if (!req.admin || !req.admin.id) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }

        const admin = await Admin.findById(req.admin.id).select("-password");
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }
        
        res.json({ 
            success: true, 
            admin 
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

// Update Admin Profile - Updated to handle password changes properly
exports.updateAdminProfile = async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Verify current password if changing any sensitive data
        if (newPassword || username !== admin.username || email !== admin.email) {
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Current password is incorrect" });
            }
        }

        // Update fields
        admin.username = username || admin.username;
        admin.email = email || admin.email;
        
        // Only update password if newPassword is provided
        if (newPassword) {
            admin.password = newPassword;
        }

        await admin.save();

        // Return updated admin data without password
        const adminData = admin.toObject();
        delete adminData.password;

        res.json({ 
            success: true, 
            message: "Profile updated successfully",
            admin: adminData
        });
    } catch (error) {
        console.error("Update profile error:", error);
        
        // Handle duplicate key error (for unique fields like username/email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field} already exists` 
            });
        }
        
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Rest of your controller methods remain the same...
// Protected Routes
exports.getAdminDashboard = (req, res) => {
    res.json({ success: true, message: "Welcome to the Admin Dashboard!" });
};

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching contacts", error: error.message });
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        res.json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching volunteers", error: error.message });
    }
};
exports.getPledges = async (req, res) => {
    try {
        const pledges = await Pledge.find(); 
        res.json({ success: true, data: pledges });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pledges", error: error.message });
    }
};


exports.getDonors = async (req, res) => {
    try {
        const donors = await Donor.find();
        res.json({ success: true, data: donors });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching donors", error: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const totalVolunteers = await Volunteer.countDocuments();
        const totalPrograms = await Programme.countDocuments();
        const totalPledges=await Pledge.countDocuments();
        res.json({
            totalDonors,
            totalVolunteers,
            totalPrograms,
            totalPledges,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching admin stats" });
    }
};


