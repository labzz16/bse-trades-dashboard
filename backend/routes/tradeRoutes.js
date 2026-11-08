const express = require("express");
const router = express.Router();

const {
  getTrades,
  getTradeStats
} = require("../controllers/tradeController");

router.get("/stats", getTradeStats);
router.get("/", getTrades);

module.exports = router;