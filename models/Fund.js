const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  totalRaised: { type: Number, default: 0 },
});

module.exports = mongoose.model('Fund', fundSchema);