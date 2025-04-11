const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    currency: {
        type: String,
        required: true
    },
    currencySymbol: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Country', countrySchema);