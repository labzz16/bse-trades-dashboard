const express = require("express");
const router = express.Router();

const {
  startPull,
  getPullStatus,
  getLatestPull
} = require("../controllers/pullController");

// Start a new trade pull
router.post("/start", startPull);

// Get the latest pull job
router.get("/latest", getLatestPull);

// Get the status of a particular pull job
router.get("/status/:jobId", getPullStatus);

module.exports = router;