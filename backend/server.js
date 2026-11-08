
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");
const PullJob = require("./models/PullJob");

const mockBseRoutes = require("./routes/mockBseRoutes");
const pullRoutes = require("./routes/pullRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

const { initializeWebSocket } = require("./websocket/socket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Mock BSE API
app.use("/", mockBseRoutes);

// Trade pull API
app.use("/api/pull", pullRoutes);

// Stored trades API
app.use("/api/trades", tradeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BSE Trades API is running"
  });
});

// Recover jobs interrupted by a previous server shutdown
const recoverInterruptedJobs = async () => {
  const result = await PullJob.updateMany(
    {
      status: { $in: ["pending", "running"] },
      isActive: true
    },
    {
      $set: {
        status: "failed",
        isActive: false,
        error: "Pull interrupted because the server restarted.",
        completedAt: new Date()
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log(
      `Recovered ${result.modifiedCount} interrupted pull job(s).`
    );
  } else {
    console.log("No interrupted pull jobs found.");
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Recover interrupted jobs before accepting new requests
    await recoverInterruptedJobs();

    // Initialize WebSocket
    initializeWebSocket(server);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
