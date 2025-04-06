const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const razorpay = require("razorpay");
const {
  loginAdmin,
  verifyAdminToken,
  getVolunteers,
  getDonors,
  getContacts,
  getPledges,
  getAdminStats,
  getAdminProfile,
  updateAdminProfile,
  generateReports,
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  getStates,
  getStateById,
  createState,
  updateState,
  deleteState,
  deleteVolunteer,
  deleteDonor,
  deleteContact,
  createDonation,
  verifyPayment
} = require("../controllers/adminController");

const {
  addProgram,
  getPrograms,
  updateProgram,
  deleteProgram
} = require("../controllers/programController");

// Initialize Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Xal312m1f8Pugg',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'SXXWWrIEiabSyA3nK4ipQkpN'
});

// Configure storage for program images
const programStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/programs'));
  },
  filename: (req, file, cb) => {
    cb(null, `program-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter for program images
const programFileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'), false);
  }
};

// Configure multer for program image uploads
const uploadProgramImage = multer({
  storage: programStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: programFileFilter
});

// ADMIN AUTHENTICATION
router.post("/login", loginAdmin);

// Verify admin token middleware for all routes below
router.use(verifyAdminToken);

// ADMIN PROFILE ROUTES
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);

// DASHBOARD ROUTES
router.get("/dashboard", (req, res) => {
  res.json({ success: true, message: "Welcome to the admin dashboard!" });
});

// PROGRAM ROUTES
router.post("/programs", uploadProgramImage.single("image"), addProgram);
router.get("/programs", getPrograms);
router.put("/programs/:id", uploadProgramImage.single("image"), updateProgram);
router.delete("/programs/:id", deleteProgram);

// DATA ROUTES
router.get("/volunteers", getVolunteers);
router.get("/donors", getDonors);
router.get("/contacts", getContacts);
router.get("/pledges", getPledges);

// DONATION ROUTES
router.post("/donations", createDonation);
router.post("/verify-payment", verifyPayment);

// Razorpay Routes
router.post('/donations/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: receipt,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);
    
    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

router.post('/donations/verify-payment', async (req, res) => {
  try {
    const { donationId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || razorpayInstance.key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update donation record
    const donation = await Donor.findByIdAndUpdate(
      donationId,
      { 
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id,
        paymentDate: new Date()
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      donation
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// REPORTING ROUTES
router.get("/reports", generateReports);
router.get("/stats", getAdminStats);

// Country Routes
router.route('/countries')
  .get(getCountries)
  .post(createCountry);

router.route('/countries/:id')
  .put(updateCountry)
  .delete(deleteCountry);

// State Routes
router.route('/states')
  .get(getStates)
  .post(createState);

router.route('/states/:id')
  .get(getStateById)
  .put(updateState)
  .delete(deleteState);

// DELETE OPERATIONS
router.delete("/volunteers/:id", deleteVolunteer);
router.delete("/donors/:id", deleteDonor);
router.delete("/contacts/:id", deleteContact);

module.exports = router;