require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const adminData = {
            username: process.env.ADMIN_USERNAME || "admin123",
            email: process.env.ADMIN_EMAIL || "admin@swachhbharat.com",
            password: process.env.ADMIN_PASSWORD || "123456"
        };

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: adminData.username });
        if (existingAdmin) {
            console.log("Admin already exists:", existingAdmin.username);
            process.exit(0);
        }

        // Create new admin
        const admin = new Admin(adminData);
        await admin.save();

        console.log("Admin created successfully:", admin.username);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();