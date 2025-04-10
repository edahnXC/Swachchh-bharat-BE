const express = require("express");
const router = express.Router();
const {
  getCountries,
  getStates
} = require("../controllers/adminController");

// Public routes for countries and states
router.get("/countries", getCountries);
router.get("/states", getStates);

module.exports = router;