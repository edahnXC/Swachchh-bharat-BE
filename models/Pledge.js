const mongoose = require("mongoose");

const PledgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  city: { type: String, required: true },
  pledges: [{ type: String, required: true }], 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pledge", PledgeSchema);
