const mongoose = require("mongoose");

const ProgrammeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model("Programme", ProgrammeSchema);
