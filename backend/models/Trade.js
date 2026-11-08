
const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    tradeId: {
      type: String,
      required: true,
      unique: true
    },
    client: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    timestamp: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trade", tradeSchema);
