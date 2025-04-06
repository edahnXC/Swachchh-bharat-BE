const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Contact = require("../models/Contact");
const Programme = require("../models/Programme");
const Pledge = require("../models/Pledge");
const Country = require('../models/Country');
const State = require('../models/State');

// Helper function for validating ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Admin Authentication (unchanged)
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const admin = await Admin.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') } 
        });
        
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        const token = jwt.sign(
            { 
                id: admin._id,
                username: admin.username,
                role: 'admin'
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" }
        );

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        });

        res.status(200).json({ 
            success: true, 
            token,
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

exports.verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || 
                req.cookies?.adminToken || 
                req.body?.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Access denied. No token provided." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not an admin token."
            });
        }
        
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
// Admin Profile Management
exports.getAdminProfile = async (req, res) => {
    try {
        if (!req.admin?.id) {
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
        
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message 
        });
    }
};

exports.updateAdminProfile = async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    
    try {
        if (!req.admin?.id) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }

        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }

        if (newPassword || username !== admin.username || email !== admin.email) {
            if (!currentPassword) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Current password is required for these changes" 
                });
            }
            
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Current password is incorrect" 
                });
            }
        }

        admin.username = username || admin.username;
        admin.email = email || admin.email;
        
        if (newPassword) {
            admin.password = newPassword;
        }

        await admin.save();

        const adminData = admin.toObject();
        delete adminData.password;

        res.json({ 
            success: true, 
            message: "Profile updated successfully",
            admin: adminData
        });
    } catch (error) {
        console.error("Update profile error:", error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field} is already in use` 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message 
        });
    }
};

// Dashboard and Stats
exports.getAdminDashboard = (req, res) => {
    res.json({ 
        success: true, 
        message: "Welcome to the Admin Dashboard!",
        admin: req.admin 
    });
};

const generateReports = async (req, res) => {
    try {
        const { type, year, month } = req.query;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        const reportYear = parseInt(year) || currentYear;
        const reportMonth = parseInt(month) || currentMonth;
        
        let startDate, endDate;
        
        if (type === 'monthly') {
            startDate = new Date(reportYear, reportMonth - 1, 1);
            endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
        } else {
            startDate = new Date(reportYear, 0, 1);
            endDate = new Date(reportYear, 11, 31, 23, 59, 59);
        }
        
        // Get all data within the date range
        const [volunteers, donors, pledges, contacts, programs] = await Promise.all([
            Volunteer.find({ createdAt: { $gte: startDate, $lte: endDate } }),
            Donor.find({ createdAt: { $gte: startDate, $lte: endDate } }),
            Pledge.find({ createdAt: { $gte: startDate, $lte: endDate } }),
            Contact.find({ createdAt: { $gte: startDate, $lte: endDate } }),
            Program.find({ date: { $gte: startDate, $lte: endDate } })
        ]);
        
        // Calculate totals
        const totalVolunteers = volunteers.length;
        const totalDonations = donors.reduce((sum, donor) => sum + (donor.amount || 0), 0);
        const totalPledges = pledges.length;
        const totalMessages = contacts.length;
        const totalPrograms = programs.length;
        
        // Prepare daily/monthly data
        let dailyVolunteers = [];
        let dailyDonations = [];
        let dailyPledges = [];
        let monthlyVolunteers = [];
        let monthlyDonations = [];
        let monthlyPledges = [];
        
        if (type === 'monthly') {
            const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
            
            // Initialize arrays with zeros for each day
            dailyVolunteers = Array(daysInMonth).fill(0);
            dailyDonations = Array(daysInMonth).fill(0);
            dailyPledges = Array(daysInMonth).fill(0);
            
            // Count data per day
            volunteers.forEach(volunteer => {
                const day = new Date(volunteer.createdAt).getDate() - 1;
                dailyVolunteers[day]++;
            });
            
            donors.forEach(donor => {
                const day = new Date(donor.createdAt).getDate() - 1;
                dailyDonations[day] += donor.amount || 0;
            });
            
            pledges.forEach(pledge => {
                const day = new Date(pledge.createdAt).getDate() - 1;
                dailyPledges[day]++;
            });
        } else {
            // Initialize arrays with zeros for each month
            monthlyVolunteers = Array(12).fill(0);
            monthlyDonations = Array(12).fill(0);
            monthlyPledges = Array(12).fill(0);
            
            // Count data per month
            volunteers.forEach(volunteer => {
                const month = new Date(volunteer.createdAt).getMonth();
                monthlyVolunteers[month]++;
            });
            
            donors.forEach(donor => {
                const month = new Date(donor.createdAt).getMonth();
                monthlyDonations[month] += donor.amount || 0;
            });
            
            pledges.forEach(pledge => {
                const month = new Date(pledge.createdAt).getMonth();
                monthlyPledges[month]++;
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                totalVolunteers,
                totalDonations,
                totalPledges,
                totalMessages,
                totalPrograms,
                dailyVolunteers,
                dailyDonations,
                dailyPledges,
                monthlyVolunteers,
                monthlyDonations,
                monthlyPledges
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalDonors,
            totalVolunteers,
            totalPrograms,
            totalPledges,
            totalContacts,
            totalCountries,
            totalStates
        ] = await Promise.all([
            Donor.countDocuments(),
            Volunteer.countDocuments(),
            Programme.countDocuments(),
            Pledge.countDocuments(),
            Contact.countDocuments(),
            Country.countDocuments(),
            State.countDocuments()
        ]);

        res.json({
            success: true,
            stats: {
                totalDonors,
                totalVolunteers,
                totalPrograms,
                totalPledges,
                totalContacts,
                totalCountries,
                totalStates
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching admin stats",
            error: error.message 
        });
    }
};

// Data Management - Volunteers
exports.getVolunteers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const [volunteers, total] = await Promise.all([
            Volunteer.find(query)
                .populate('country', 'name')
                .populate('state', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Volunteer.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: volunteers,
            count: volunteers.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching volunteers",
            error: error.message 
        });
    }
};

exports.getVolunteerById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const volunteer = await Volunteer.findById(req.params.id)
            .populate('country', 'name')
            .populate('state', 'name');
            
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found"
            });
        }
        
        res.json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        console.error("Error fetching volunteer:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching volunteer",
            error: error.message 
        });
    }
};

exports.createVolunteer = async (req, res) => {
    try {
        const { country, state, ...otherData } = req.body;

        // Validate country and state
        if (!isValidObjectId(country) || !isValidObjectId(state)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid country or state ID format" 
            });
        }

        const [countryExists, stateExists] = await Promise.all([
            Country.findById(country),
            State.findOne({ _id: state, country: country })
        ]);

        if (!countryExists) {
            return res.status(400).json({
                success: false,
                message: "Country not found"
            });
        }

        if (!stateExists) {
            return res.status(400).json({
                success: false,
                message: "State not found or doesn't belong to the country"
            });
        }

        const volunteer = new Volunteer({
            country,
            state,
            ...otherData
        });

        await volunteer.save();
        
        res.status(201).json({
            success: true,
            message: "Volunteer created successfully",
            data: await volunteer.populate('country state', 'name')
        });
    } catch (error) {
        console.error("Error creating volunteer:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is already registered" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error creating volunteer",
            error: error.message 
        });
    }
};

exports.deleteVolunteer = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({ 
                success: false, 
                message: "Volunteer not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Volunteer deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting volunteer:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting volunteer",
            error: error.message 
        });
    }
};

// Data Management - Donors
exports.getDonors = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const [donors, total] = await Promise.all([
            Donor.find(query)
                .populate('country', 'name code')
                .populate('state', 'name code')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Donor.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: donors,
            count: donors.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching donors:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching donors",
            error: error.message 
        });
    }
};
exports.createDonation = async (req, res) => {
    try {
        const { name, email, amount, country, state, city, phone, address } = req.body;

        // Validate required fields
        if (!name || !email || !amount || !country || !state || !city || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "All required fields must be provided" 
            });
        }

        // Validate country and state IDs
        if (!isValidObjectId(country) || !isValidObjectId(state)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid country or state ID format" 
            });
        }

        // Verify country exists
        const countryExists = await Country.findById(country);
        if (!countryExists) {
            return res.status(400).json({ 
                success: false, 
                message: "Country not found" 
            });
        }

        // Verify state exists and belongs to country
        const stateExists = await State.findOne({ _id: state, country: country });
        if (!stateExists) {
            return res.status(400).json({ 
                success: false, 
                message: "State not found or doesn't belong to the country" 
            });
        }

        const newDonation = new Donor({
            name,
            email,
            amount,
            country,
            state,
            city,
            phone,
            address,
            paymentStatus: 'pending'
        });

        await newDonation.save();

        res.status(201).json({ 
            success: true, 
            message: "Donation created successfully",
            data: await newDonation.populate('country state', 'name code')
        });
    } catch (error) {
        console.error("Error creating donation:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is already registered" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error creating donation",
            error: error.message 
        });
    }
};
exports.verifyPayment = async (req, res) => {
    try {
        const { donationId, paymentId } = req.body;

        if (!isValidObjectId(donationId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid donation ID format" 
            });
        }

        const donation = await Donor.findByIdAndUpdate(
            donationId,
            { 
                paymentStatus: 'completed', 
                paymentId,
                paymentDate: new Date() 
            },
            { new: true }
        ).populate('country state', 'name code');

        if (!donation) {
            return res.status(404).json({ 
                success: false, 
                message: "Donation not found" 
            });
        }

        res.json({ 
            success: true, 
            message: "Payment verified successfully",
            data: donation 
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error verifying payment",
            error: error.message 
        });
    }
};
exports.deleteDonor = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const donor = await Donor.findByIdAndDelete(req.params.id);
        
        if (!donor) {
            return res.status(404).json({ 
                success: false, 
                message: "Donor not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Donor deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting donor:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting donor",
            error: error.message 
        });
    }
}; 

// Data Management - Contacts
exports.getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const [contacts, total] = await Promise.all([
            Contact.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Contact.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: contacts,
            count: contacts.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching contacts",
            error: error.message 
        });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: "Contact not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Contact deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting contact",
            error: error.message 
        });
    }
};
exports.createPledge = async (req, res) => {
    try {
        const { country, state, ...otherData } = req.body;

        // Validate country and state
        if (!isValidObjectId(country) || !isValidObjectId(state)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid country or state ID format" 
            });
        }

        const [countryExists, stateExists] = await Promise.all([
            Country.findById(country),
            State.findOne({ _id: state, country: country })
        ]);

        if (!countryExists) {
            return res.status(400).json({
                success: false,
                message: "Country not found"
            });
        }

        if (!stateExists) {
            return res.status(400).json({
                success: false,
                message: "State not found or doesn't belong to the country"
            });
        }

        const pledge = new Pledge({
            country,
            state,
            ...otherData
        });

        await pledge.save();
        
        res.status(201).json({
            success: true,
            message: "Pledge created successfully",
            data: await pledge.populate('country state', 'name code')
        });
    } catch (error) {
        console.error("Error creating pledge:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is already registered" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error creating pledge",
            error: error.message 
        });
    }
};
// Data Management - Pledges
exports.getPledges = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const [pledges, total] = await Promise.all([
            Pledge.find(query)
                .populate('country', 'name')
                .populate('state', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Pledge.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: pledges,
            count: pledges.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching pledges:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching pledges",
            error: error.message 
        });
    }
};


exports.deletePledge = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const pledge = await Pledge.findByIdAndDelete(req.params.id);
        
        if (!pledge) {
            return res.status(404).json({ 
                success: false, 
                message: "Pledge not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Pledge deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting pledge:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting pledge",
            error: error.message 
        });
    }
};

// Country Management
exports.getCountries = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const [countries, total] = await Promise.all([
            Country.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Country.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: countries,
            count: countries.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching countries:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching countries",
            error: error.message 
        });
    }
};

exports.createCountry = async (req, res) => {
    try {
        const { name, code, currency, currencySymbol } = req.body;
        
        if (!name || !code) {
            return res.status(400).json({ 
                success: false, 
                message: "Name and code are required" 
            });
        }

        const country = new Country({
            name,
            code,
            currency: currency || 'INR',
            currencySymbol: currencySymbol || '₹'
        });

        await country.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Country created successfully",
            data: country 
        });
    } catch (error) {
        console.error("Error creating country:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Country with this name or code already exists" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error creating country",
            error: error.message 
        });
    }
};

exports.getCountryById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const country = await Country.findById(req.params.id);
        
        if (!country) {
            return res.status(404).json({ 
                success: false, 
                message: "Country not found" 
            });
        }
            
        res.json({ 
            success: true, 
            data: country
        });
    } catch (error) {
        console.error("Error fetching country:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching country",
            error: error.message 
        });
    }
};

exports.updateCountry = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const { name, code, currency, currencySymbol } = req.body;
        
        const country = await Country.findByIdAndUpdate(
            req.params.id,
            { name, code, currency, currencySymbol },
            { new: true, runValidators: true }
        );
        
        if (!country) {
            return res.status(404).json({ 
                success: false, 
                message: "Country not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Country updated successfully",
            data: country 
        });
    } catch (error) {
        console.error("Error updating country:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Country with this name or code already exists" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error updating country",
            error: error.message 
        });
    }
};

exports.deleteCountry = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const country = await Country.findByIdAndDelete(req.params.id);
        
        if (!country) {
            return res.status(404).json({ 
                success: false, 
                message: "Country not found" 
            });
        }

        // Delete associated states
        await State.deleteMany({ country: req.params.id });
        
        res.json({ 
            success: true, 
            message: "Country and its states deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting country:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting country",
            error: error.message 
        });
    }
};

// State Management
exports.getStates = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, country } = req.query;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }
        if (country && isValidObjectId(country)) {
            query.country = country;
        }

        const [states, total] = await Promise.all([
            State.find(query)
                .populate('country', 'name code')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            State.countDocuments(query)
        ]);

        res.json({ 
            success: true, 
            data: states,
            count: states.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching states:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching states",
            error: error.message 
        });
    }
};

exports.getStateById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const state = await State.findById(req.params.id)
            .populate('country', 'name code');
        
        if (!state) {
            return res.status(404).json({ 
                success: false, 
                message: "State not found" 
            });
        }
            
        res.json({ 
            success: true, 
            data: state
        });
    } catch (error) {
        console.error("Error fetching state:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching state",
            error: error.message 
        });
    }
};

exports.createState = async (req, res) => {
    try {
        const { name, code, country } = req.body;
        
        if (!name || !code || !country) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, code and country are required" 
            });
        }

        if (!isValidObjectId(country)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid country ID format" 
            });
        }

        // Check if country exists
        const countryExists = await Country.findById(country);
        if (!countryExists) {
            return res.status(400).json({ 
                success: false, 
                message: "Country not found" 
            });
        }

        // Check if state with same name or code already exists in this country
        const existingState = await State.findOne({
            $and: [
                { country },
                { $or: [{ name }, { code }] }
            ]
        });

        if (existingState) {
            return res.status(400).json({ 
                success: false, 
                message: "State with this name or code already exists in this country" 
            });
        }

        const state = new State({
            name,
            code,
            country
        });

        await state.save();
        
        res.status(201).json({ 
            success: true, 
            message: "State created successfully",
            data: await state.populate('country', 'name code')
        });
    } catch (error) {
        console.error("Error creating state:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "State with this name or code already exists" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error creating state",
            error: error.message 
        });
    }
};
exports.updateState = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const { name, code, country } = req.body;
        
        if (!name || !code || !country) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, code and country are required" 
            });
        }

        if (!isValidObjectId(country)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid country ID format" 
            });
        }

        // Check if country exists
        const countryExists = await Country.findById(country);
        if (!countryExists) {
            return res.status(400).json({ 
                success: false, 
                message: "Country not found" 
            });
        }

        const state = await State.findByIdAndUpdate(
            req.params.id,
            { name, code, country },
            { new: true, runValidators: true }
        ).populate('country', 'name code');
        
        if (!state) {
            return res.status(404).json({ 
                success: false, 
                message: "State not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "State updated successfully",
            data: state 
        });
    } catch (error) {
        console.error("Error updating state:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "State with this name or code already exists" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Error updating state",
            error: error.message 
        });
    }
};

exports.deleteState = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid ID format" 
            });
        }

        const state = await State.findByIdAndDelete(req.params.id);
        
        if (!state) {
            return res.status(404).json({ 
                success: false, 
                message: "State not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "State deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting state:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting state",
            error: error.message 
        });
    }
};