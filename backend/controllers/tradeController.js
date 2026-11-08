const Trade = require("../models/Trade");

const getTrades = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const skip = (page - 1) * limit;

    // Fetch existing trades from MongoDB
    const [trades, totalRecords] = await Promise.all([
      Trade.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Trade.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      recordsInPage: trades.length,
      trades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stored trades",
      error: error.message
    });
  }
};

const getTradeStats = async (req, res) => {
  try {
    const result = await Trade.aggregate([
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          averagePrice: { $avg: "$price" },
          totalValue: {
            $sum: { $multiply: ["$quantity", "$price"] }
          },
          symbols: { $addToSet: "$symbol" }
        }
      }
    ]);

    const stats = result[0] || {
      totalTrades: 0,
      totalQuantity: 0,
      averagePrice: 0,
      totalValue: 0,
      symbols: []
    };

    res.status(200).json({
      success: true,
      stats: {
        totalTrades: stats.totalTrades,
        totalQuantity: stats.totalQuantity,
        averagePrice: Number(stats.averagePrice.toFixed(2)),
        totalValue: Number(stats.totalValue.toFixed(2)),
        symbolCount: stats.symbols.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve trade statistics",
      error: error.message
    });
  }
};

module.exports = { getTrades, getTradeStats };