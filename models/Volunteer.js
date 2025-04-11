const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  city: { type: String, required: true },
  number: { type: String, required: true },
  message: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);