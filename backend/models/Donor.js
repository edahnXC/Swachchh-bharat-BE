const mongoose = require("mongoose");

const DonorSchema = new mongoose.Schema({
  // Core Identification
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[0-9\s\-\(\)]{10,15}$/, 'Please fill a valid phone number']
  },

  // Donation Details
  amount: { 
    type: Number, 
    required: true,
    min: [1, 'Amount must be at least 1']
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Location Information
  address: {
    type: String,
    trim: true
  },
  country: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Country', 
    required: true 
  },
  state: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'State', 
    required: true 
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit postal code']
  },

  // Payment Tracking
  paymentStatus: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  paymentId: { 
    type: String,
    index: true
  },
  orderId: {
    type: String,
    index: true,
    unique: true
  },

  // System Fields
  ipAddress: {
    type: String
  },
  
  // Additional tracking
  donationCount: {
    type: Number,
    default: 1
  },
  totalDonated: {
    type: Number,
    default: function() { return this.amount; }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
DonorSchema.index({ email: 1 });
DonorSchema.index({ paymentStatus: 1 });
DonorSchema.index({ paymentId: 1 });
DonorSchema.index({ createdAt: -1 });

// Pre-save hook
DonorSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await this.constructor.countDocuments({ email: this.email });
      this.donationCount = count + 1;
      
      if (this.paymentStatus === 'completed' && this.isModified('paymentStatus')) {
        const completedDonations = await this.constructor.aggregate([
          { $match: { email: this.email, paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        this.totalDonated = (completedDonations[0]?.total || 0) + this.amount;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Static method
DonorSchema.statics.getDonorHistory = async function(email) {
  return this.find({ email })
    .sort({ createdAt: -1 })
    .select('amount paymentStatus createdAt paymentId');
};

const Donor = mongoose.model("Donor", DonorSchema);

// Modern way to handle indexes (async/await)
async function initializeIndexes() {
  try {
    // Drop existing indexes
    await Donor.collection.dropIndexes();
    console.log('All indexes dropped');
    
    // Create new indexes
    await Donor.init();
    console.log('Indexes created successfully');
  } catch (err) {
    console.log('Index initialization error:', err.message);
    // Continue even if index operations fail
  }
}

// Run index initialization when model is loaded
initializeIndexes();

module.exports = Donor;