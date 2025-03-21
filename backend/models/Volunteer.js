const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  number: { type: String, required: true },
  message: { type: String },
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);
