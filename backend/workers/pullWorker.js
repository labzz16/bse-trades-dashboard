const axios = require("axios");
const Trade = require("../models/Trade");
const PullJob = require("../models/PullJob");
const { broadcast } = require("../websocket/socket");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runPullWorker = async (jobId) => {
  try {
    const job = await PullJob.findById(jobId);

    if (!job) {
      throw new Error("Pull job not found");
    }

    const batchSize = Number(process.env.BSE_BATCH_SIZE) || 100;
    const totalDuration = Number(process.env.BSE_PULL_DURATION_MS) || 15000;
    console.log("Configured pull duration:", totalDuration, "ms");

    const totalRecordsResponse = await axios.get(
      "http://localhost:5000/getTrades?page=1&limit=1",
      { timeout: 25000 },
    );

    const totalRecords = totalRecordsResponse.data.totalRecords;
    const totalPages = Math.ceil(totalRecords / batchSize);

    await PullJob.findByIdAndUpdate(jobId, {
      status: "running",
      totalRecords,
      startedAt: new Date(),
    });
    broadcast({
      type: "PULL_STARTED",
      jobId: String(jobId),
      totalRecords,
    });

    const delayBetweenBatches =
      totalPages > 1 ? totalDuration / (totalPages - 1) : 0;

    let processedRecords = 0;

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(
        `http://localhost:5000/getTrades?page=${page}&limit=${batchSize}`,
        { timeout: 25000 },
      );

      const trades = response.data.trades;

      if (trades.length > 0) {
        const operations = trades.map((trade) => ({
          updateOne: {
            filter: { tradeId: trade.tradeId },
            update: { $set: trade },
            upsert: true,
          },
        }));

        await Trade.bulkWrite(operations, { ordered: false });
      }
      if (trades.length > 0) {
        broadcast({
          type: "NEW_TRADES",
          jobId: String(jobId),
          trades,
        });
      }

      processedRecords += trades.length;

      await PullJob.findByIdAndUpdate(jobId, {
        processedRecords,
      });
      broadcast({
        type: "PULL_PROGRESS",
        jobId: String(jobId),
        totalRecords,
        processedRecords,
        progress: Math.round((processedRecords / totalRecords) * 100),
      });

      console.log(
        `Pull ${jobId}: ${processedRecords}/${totalRecords} trades processed`,
      );

      if (page < totalPages && delayBetweenBatches > 0) {
        await sleep(delayBetweenBatches);
      }
    }

    await PullJob.findByIdAndUpdate(jobId, {
      status: "completed",
      isActive: false,
      processedRecords,
      completedAt: new Date(),
    });
    broadcast({
      type: "PULL_COMPLETED",
      jobId: String(jobId),
      totalRecords,
      processedRecords,
    });

    console.log(`Pull ${jobId} completed successfully`);
  } catch (error) {
    console.error("Pull worker failed:", error.message);

    await PullJob.findByIdAndUpdate(jobId, {
      status: "failed",
      isActive: false,
      error: error.message,
      completedAt: new Date(),
    });

    broadcast({
      type: "PULL_FAILED",
      jobId: String(jobId),
      error: error.message,
    });
  }
};

module.exports = runPullWorker;
