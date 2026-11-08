const mongoose = require("mongoose");

const pullJobSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending"
    },
    isActive: {
      type: Boolean,
      default: false
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    processedRecords: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// MongoDB allows only one active pull job at a time.
pullJobSchema.index(
  { isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("PullJob", pullJobSchema);