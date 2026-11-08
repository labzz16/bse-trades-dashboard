require("dotenv").config();

const mongoose = require("mongoose");
const Trade = require("../models/Trade");
const mockTrades = require("../services/mockBseData");

const seedTrades = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for seeding");

    const operations = mockTrades.map((trade) => ({
      updateOne: {
        filter: { tradeId: trade.tradeId },
        update: { $setOnInsert: trade },
        upsert: true
      }
    }));

    const result = await Trade.bulkWrite(operations, {
      ordered: false
    });

    console.log("Initial trade seeding completed");
    console.log(`Trades available: ${mockTrades.length}`);
    console.log(`New trades inserted: ${result.upsertedCount}`);

  } catch (error) {
    console.error("Trade seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedTrades();