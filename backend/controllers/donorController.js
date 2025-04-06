require('dotenv').config();
const crypto = require('crypto');
const Donor = require("../models/Donor");
const Fund = require("../models/Fund");
const razorpay = require('razorpay');

// Initialize Razorpay instance
const rzpInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to update total funds
async function updateTotalFunds(amount) {
  try {
    const fund = await Fund.findOneAndUpdate(
      {},
      { $inc: { totalRaised: amount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return fund.totalRaised;
  } catch (error) {
    console.error('Error updating total funds:', error);
    throw error;
  }
}

exports.createDonation = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      amount: amountInput, 
      country, 
      state, 
      city, 
      postalCode, 
      address,
      currency = 'INR'
    } = req.body;

    // Convert amount to number
    const amount = parseFloat(amountInput);

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'amount', 'country', 'state', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'amount') return typeof req.body[field] === 'undefined';
      return !req.body[field];
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate amount
    if (isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount format"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Create new donation record
    const newDonation = new Donor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      amount,
      currency,
      country,
      state,
      city: city.trim(),
      postalCode: postalCode.trim(),
      address: address?.trim(),
      paymentStatus: 'pending',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    // Create Razorpay order
    const rzpOrder = await rzpInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      payment_capture: 1, // Auto-capture payment
      notes: {
        donorEmail: email,
        donorName: name
      }
    });

    // Link Razorpay order with donation
    newDonation.orderId = rzpOrder.id;
    await newDonation.save();

    res.status(201).json({ 
      success: true, 
      message: "Donation initiated successfully",
      data: {
        donationId: newDonation._id,
        orderId: rzpOrder.id,
        amount,
        currency,
        email,
        paymentStatus: newDonation.paymentStatus,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        callbackUrl: `${process.env.CLIENT_URL}/payment/verify`
      }
    });

  } catch (error) {
    console.error("Donation Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed",
        errors 
      });
    }

    // Handle Razorpay errors
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        message: "Payment gateway error",
        error: error.error.description
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, donationId } = req.body;

    // Validate payment parameters
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !donationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required payment parameters" 
      });
    }

    // Find donation by ID
    const donation = await Donor.findById(donationId);
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: "Donation record not found" 
      });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    // Update donation record
    donation.paymentId = razorpay_payment_id;
    donation.paymentStatus = 'completed';
    donation.paymentDate = new Date();
    await donation.save();

    // Update total funds
    const totalRaised = await updateTotalFunds(donation.amount);

    res.json({ 
      success: true, 
      message: "Payment verified successfully",
      data: {
        donationId: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        paymentStatus: donation.paymentStatus,
        paymentDate: donation.paymentDate,
        totalRaised,
        receiptUrl: `https://dashboard.razorpay.com/payments/${razorpay_payment_id}`
      }
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Donation ID format" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donor.findById(donationId);
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: "Donation not found" 
      });
    }

    res.json({
      success: true,
      data: {
        status: donation.paymentStatus,
        amount: donation.amount,
        currency: donation.currency,
        createdAt: donation.createdAt,
        ...(donation.paymentStatus === 'completed' && {
          paymentId: donation.paymentId,
          paymentDate: donation.paymentDate
        })
      }
    });

  } catch (error) {
    console.error("Donation Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching donation status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getFundStats = async (req, res) => {
  try {
    const fund = await Fund.findOne({});
    const totalDonations = await Donor.countDocuments({ paymentStatus: 'completed' });
    const recentDonations = await Donor.find({ paymentStatus: 'completed' })
      .sort({ paymentDate: -1 })
      .limit(5)
      .select('name amount paymentDate');
    
    res.json({
      success: true,
      data: {
        totalRaised: fund?.totalRaised || 0,
        totalDonations,
        averageDonation: fund?.totalRaised ? (fund.totalRaised / totalDonations).toFixed(2) : 0,
        recentDonations
      }
    });
  } catch (error) {
    console.error("Fund Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching fund statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status) {
      query.paymentStatus = status;
    }

    const donations = await Donor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('name email amount currency paymentStatus createdAt paymentDate');

    const total = await Donor.countDocuments(query);

    res.json({
      success: true,
      data: {
        donations,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get All Donations Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching donations",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};