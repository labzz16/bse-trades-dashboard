const express = require("express");
const router = express.Router();

const trades = require("../services/mockBseData");

// GET /getTrades?page=1&limit=100
router.get("/getTrades", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      500,
      Math.max(1, parseInt(req.query.limit) || 100)
    );

    const delayMs = Math.min(
      25000,
      Math.max(0, parseInt(req.query.delayMs) || 0)
    );

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const startIndex = (page - 1) * limit;
    const pageTrades = trades.slice(
      startIndex,
      startIndex + limit
    );

    res.status(200).json({
      success: true,
      totalRecords: trades.length,
      currentPage: page,
      totalPages: Math.ceil(trades.length / limit),
      recordsInPage: pageTrades.length,
      hasMore: startIndex + limit < trades.length,
      trades: pageTrades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch mock BSE trades",
      error: error.message
    });
  }
});

module.exports = router;