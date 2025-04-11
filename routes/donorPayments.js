const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Donation = require('../models/Donor');
const Fund = require('../models/Fund');

// Verify payment and update records
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      donationId, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      amount
    } = req.body;
    
    // 1. Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment signature' 
      });
    }

    // 2. Update donation record
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      {
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: Number(amount),
        completedAt: new Date()
      },
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({ 
        success: false,
        message: 'Donation record not found' 
      });
    }

    // 3. Update total funds raised
    await Fund.findOneAndUpdate(
      {},
      { $inc: { totalRaised: Number(amount) } },
      { upsert: true }
    );

    res.json({ 
      success: true,
      message: 'Payment verified successfully'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed', 
      error: error.message 
    });
  }
});

// Get Razorpay key
router.get('/config/razorpay', (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

module.exports = router;