// Database models for enhanced tracking
const mongoose = require("mongoose")

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: "LearningPath", required: true },
  resourceId: { type: String, required: true },
  interactionType: {
    type: String,
    enum: ["viewed", "completed", "bookmarked", "shared", "downloaded"],
    required: true,
  },
  duration: { type: Number }, // in seconds
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
})

// Learning Session Schema
const learningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: "LearningPath", required: true },
  sessionStart: { type: Date, required: true },
  sessionEnd: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  interactions: { type: String }, // JSON string of interactions
  createdAt: { type: Date, default: Date.now },
})

// Enhanced Week Completion Schema
const weekCompletionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: "LearningPath", required: true },
  weekNumber: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  hoursSpent: { type: Number },
  selfAssessment: { type: String }, // JSON string
  reflectionNotes: { type: String },
  confidence: { type: Number, min: 1, max: 5 },
  autoProgress: { type: Number }, // Calculated progress percentage
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = {
  ActivityLog: mongoose.model("ActivityLog", activityLogSchema),
  LearningSession: mongoose.model("LearningSession", learningSessionSchema),
  WeekCompletion: mongoose.model("WeekCompletion", weekCompletionSchema),
}
