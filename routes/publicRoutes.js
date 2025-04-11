const express = require("express");
const router = express.Router();

const {
  getCountries,
  getStates
} = require("../controllers/adminController");

const {
  getPrograms
} = require("../controllers/programController");  

// Public routes for countries and states
router.get("/countries", getCountries);
router.get("/states", getStates);

// Public route for programs
router.get("/getPrograms", getPrograms); 

module.exports = router;
