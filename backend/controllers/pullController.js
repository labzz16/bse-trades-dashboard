const PullJob = require("../models/PullJob");
const runPullWorker = require("../workers/pullWorker");

const startPull = async (req, res) => {
  let job;

  try {
    // Ensure the unique index exists before accepting pull requests.
    await PullJob.init();

    // Create an active job atomically.
    job = await PullJob.create({
      status: "pending",
      isActive: true,
      totalRecords: 0,
      processedRecords: 0
    });

    // Start worker without blocking the response.
    setImmediate(() => {
      runPullWorker(job._id);
    });

    return res.status(202).json({
      success: true,
      message: "Trade pull started successfully",
      jobId: job._id,
      status: job.status
    });
  } catch (error) {
    // Another request already created an active job.
    if (error.code === 11000) {
      const activeJob = await PullJob.findOne({
        isActive: true
      }).lean();

      return res.status(409).json({
        success: false,
        message: "A trade pull is already in progress.",
        jobId: activeJob?._id || null,
        status: activeJob?.status || "running"
      });
    }

    // Release the lock if job creation succeeded but startup failed.
    if (job) {
      await PullJob.findByIdAndUpdate(job._id, {
        status: "failed",
        isActive: false,
        error: error.message,
        completedAt: new Date()
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to start trade pull",
      error: error.message
    });
  }
};

const getPullStatus = async (req, res) => {
  try {
    const job = await PullJob.findById(req.params.jobId).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Pull job not found"
      });
    }

    const progress = job.totalRecords > 0
      ? Math.round(
          (job.processedRecords / job.totalRecords) * 100
        )
      : 0;

    return res.status(200).json({
      success: true,
      job,
      progress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pull status",
      error: error.message
    });
  }
};

const getLatestPull = async (req, res) => {
  try {
    const job = await PullJob.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!job) {
      return res.status(200).json({
        success: true,
        job: null,
        progress: 0
      });
    }

    const progress = job.totalRecords > 0
      ? Math.round(
          (job.processedRecords / job.totalRecords) * 100
        )
      : 0;

    return res.status(200).json({
      success: true,
      job,
      progress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve latest pull status",
      error: error.message
    });
  }
};

module.exports = { startPull, getPullStatus, getLatestPull };