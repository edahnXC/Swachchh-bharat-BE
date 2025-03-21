const mongoose = require("mongoose");

const PledgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  city: { type: String, required: true },
  pledges: [{ type: String, required: true }], 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pledge", PledgeSchema);
