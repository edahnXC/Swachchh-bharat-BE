const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Donor = require("../models/Donor");

const signupDonor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if the donor already exists
    let existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." });
    }

    // Create and save new donor (Schema handles password hashing)
    const newDonor = new Donor({ name, email, password });
    await newDonor.save();

    res.status(201).json({ success: true, message: "Signup successful! Please log in." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find donor by email
    const donor = await Donor.findOne({ email });
    if (!donor) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ donorId: donor._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Store the token in an HTTP-only cookie for security
    res.cookie("donorToken", token, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 3600000 });

    res.json({ success: true, message: "Login successful!", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Logout functionality
const logoutDonor = (req, res) => {
  res.clearCookie("donorToken");
  res.json({ success: true, message: "Logged out successfully!" });
};

// Middleware to check authentication
const verifyToken = (req, res, next) => {
  const token = req.cookies.donorToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.donorId = decoded.donorId;
    next();
  });
};

module.exports = { signupDonor, loginDonor, logoutDonor, verifyToken };
