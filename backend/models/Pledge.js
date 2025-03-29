const mongoose = require("mongoose");

const PledgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Make email required and unique
  city: { type: String, required: true },
  pledges: [{ type: String, required: true }], 
  date: { type: Date, default: Date.now } // Keep track of pledge date
});

module.exports = mongoose.model("Pledge", PledgeSchema);
