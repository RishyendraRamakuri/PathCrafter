import mongoose from "mongoose"

// Enhanced Progress Schema for detailed tracking
const progressSchema = new mongoose.Schema(
  {
    completion_percentage: { type: Number, default: 0, min: 0, max: 100 },
    current_week: { type: Number, default: 1 },
    completed_weeks: [Number], // Array of completed week numbers
    total_hours_logged: { type: Number, default: 0 },
    last_activity: { type: Date, default: Date.now },

    // Week-specific progress tracking
    week_progress: {
      type: Map,
      of: {
        resources_completed: [String], // Array of resource IDs
        objectives_completed: [String], // Array of objective IDs
        progress_percentage: { type: Number, default: 0 },
        hours_spent: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        completed_at: Date,
        self_assessment: mongoose.Schema.Types.Mixed,
        reflection_notes: String,
        confidence: { type: Number, min: 1, max: 5 },
      },
    },

    // Activity tracking
    resource_interactions: [
      {
        resource_id: String,
        interaction_type: { type: String, enum: ["viewed", "completed", "bookmarked"] },
        timestamp: { type: Date, default: Date.now },
        duration: Number, // in seconds
      },
    ],

    // Learning sessions
    sessions: [
      {
        start_time: Date,
        end_time: Date,
        duration: Number, // in minutes
        interactions_count: Number,
      },
    ],
  },
  { _id: false },
)

// Make the weekly plan schema more flexible
const weeklyPlanSchema = new mongoose.Schema(
  {
    week: Number,
    phase: String,
    focus: String,
    primary_topic: String,
    subtopics: [String],
    learning_objectives: [String],
    activities: [String],
    deliverables: [String],
    estimated_hours: Number,
    difficulty_level: String,
    resources_needed: [], // Make this completely flexible
    assessment: mongoose.Schema.Types.Mixed,
    completed: Boolean,
    completed_at: Date,
  },
  { strict: false },
) // Allow any fields

// Schema for milestones - more flexible
const milestoneSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    description: String,
    target_week: Number,
    completion_criteria: [String],
    skills_acquired: [String],
    estimated_hours: Number,
    reward: String,
    next_steps: String,
    completed: Boolean,
    completion_date: Date,
  },
  { strict: false },
) // Allow any fields

// Main Learning Path Schema
const LearningPathSchema = new mongoose.Schema(
  {
    // User Input Fields (what user submits in the form)
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    goals: {
      type: [String],
      validate: {
        validator: (goals) => !goals || goals.every((goal) => goal.trim().length > 0),
        message: "Each goal must be a non-empty string",
      },
    },
    preferredDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: [true, "Difficulty level is required"],
      default: "beginner",
    },
    availableTimePerWeek: {
      type: Number,
      required: [true, "Available time per week is required"],
      min: [1, "Available time must be at least 1 hour"],
      max: [40, "Available time cannot exceed 40 hours"],
    },
    durationWeeks: {
      type: Number,
      required: [true, "Duration in weeks is required"],
      min: [1, "Duration must be at least 1 week"],
      max: [52, "Duration cannot exceed 52 weeks"],
    },
    preferredTopics: {
      type: [String],
      default: [],
    },

    // System Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    status: {
      type: String,
      enum: ["draft", "generating", "active", "completed", "paused", "archived"],
      default: "draft",
    },

    // ML Generated Content (populated after ML service processes the input)
    mlGenerated: {
      type: Boolean,
      default: false,
    },
    mlGeneratedContent: {
      type: mongoose.Schema.Types.Mixed, // Make this completely flexible
    },
    mlGenerationError: {
      error: String,
      timestamp: Date,
      retry_count: {
        type: Number,
        default: 0,
      },
    },

    // Enhanced Progress Tracking
    progress: progressSchema,

    // Dates
    startDate: Date,
    expectedEndDate: Date,
    actualEndDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: false, // Allow any fields
  },
)

// Virtual field for total learning hours (from user input)
LearningPathSchema.virtual("totalLearningHours").get(function () {
  return this.availableTimePerWeek * this.durationWeeks
})

// Virtual field for ML-generated total hours
LearningPathSchema.virtual("mlTotalHours").get(function () {
  return this.mlGeneratedContent?.total_hours || 0
})

// Virtual field to check if path is overdue
LearningPathSchema.virtual("isOverdue").get(function () {
  if (!this.expectedEndDate) return false
  return new Date() > this.expectedEndDate && this.status !== "completed"
})

// Pre-save hook to calculate expected end date
LearningPathSchema.pre("save", function (next) {
  // Initialize progress if it doesn't exist
  if (!this.progress) {
    this.progress = {
      completion_percentage: 0,
      current_week: 1,
      completed_weeks: [],
      total_hours_logged: 0,
      last_activity: new Date(),
      week_progress: new Map(),
      resource_interactions: [],
      sessions: [],
    }
  }

  // Set expected end date when path becomes active
  if (this.isModified("status") && this.status === "active" && !this.expectedEndDate) {
    this.startDate = this.startDate || new Date()
    this.expectedEndDate = new Date(this.startDate)
    this.expectedEndDate.setDate(this.expectedEndDate.getDate() + this.durationWeeks * 7)
  }

  // Remove duplicate goals and topics
  if (this.goals) {
    this.goals = [...new Set(this.goals.filter((goal) => goal.trim().length > 0))]
  }
  if (this.preferredTopics) {
    this.preferredTopics = [...new Set(this.preferredTopics.filter((topic) => topic.trim().length > 0))]
  }

  next()
})

// Instance method to track resource interaction
LearningPathSchema.methods.trackResourceInteraction = function (resourceId, interactionType, duration = null) {
  if (!this.progress.resource_interactions) {
    this.progress.resource_interactions = []
  }

  this.progress.resource_interactions.push({
    resource_id: resourceId,
    interaction_type: interactionType,
    timestamp: new Date(),
    duration: duration,
  })

  this.progress.last_activity = new Date()
  return this.save()
}

// Instance method to update week progress
LearningPathSchema.methods.updateWeekProgress = function (weekNumber, progressData) {
  if (!this.progress.week_progress) {
    this.progress.week_progress = new Map()
  }

  const currentWeekProgress = this.progress.week_progress.get(weekNumber.toString()) || {
    resources_completed: [],
    objectives_completed: [],
    progress_percentage: 0,
    hours_spent: 0,
    completed: false,
  }

  // Merge new progress data
  const updatedProgress = { ...currentWeekProgress, ...progressData }
  this.progress.week_progress.set(weekNumber.toString(), updatedProgress)

  // Update overall progress
  this.calculateOverallProgress()
  this.progress.last_activity = new Date()

  return this.save()
}

// Instance method to complete a week
LearningPathSchema.methods.completeWeek = function (weekNumber, completionData) {
  const { hoursSpent, selfAssessment, reflectionNotes, confidence } = completionData

  // Update week progress
  this.updateWeekProgress(weekNumber, {
    completed: true,
    completed_at: new Date(),
    hours_spent: hoursSpent,
    self_assessment: selfAssessment,
    reflection_notes: reflectionNotes,
    confidence: confidence,
    progress_percentage: 100,
  })

  // Add to completed weeks if not already there
  if (!this.progress.completed_weeks.includes(weekNumber)) {
    this.progress.completed_weeks.push(weekNumber)
  }

  // Update total hours and current week
  this.progress.total_hours_logged += Number.parseFloat(hoursSpent || 0)
  this.progress.current_week = Math.max(this.progress.current_week, weekNumber + 1)

  // Calculate overall progress
  this.calculateOverallProgress()

  return this.save()
}

// Instance method to calculate overall progress
LearningPathSchema.methods.calculateOverallProgress = function () {
  const totalWeeks = this.durationWeeks || 8
  const completedWeeks = this.progress.completed_weeks.length

  this.progress.completion_percentage = Math.round((completedWeeks / totalWeeks) * 100)

  // Update status if completed
  if (this.progress.completion_percentage >= 100) {
    this.status = "completed"
    this.actualEndDate = new Date()
  }

  return this.progress.completion_percentage
}

// Instance method to log learning session
LearningPathSchema.methods.logSession = function (sessionData) {
  const { sessionStart, sessionEnd, duration, interactionsCount } = sessionData

  if (!this.progress.sessions) {
    this.progress.sessions = []
  }

  this.progress.sessions.push({
    start_time: new Date(sessionStart),
    end_time: new Date(sessionEnd),
    duration: duration,
    interactions_count: interactionsCount || 0,
  })

  this.progress.last_activity = new Date()
  return this.save()
}

// Static method to find paths by user with progress
LearningPathSchema.statics.findByUserWithProgress = function (userId) {
  return this.find({ createdBy: userId })
    .select("-mlGeneratedContent.resources -mlGeneratedContent.weekly_plan.resources_needed")
    .sort({ updatedAt: -1 })
}

// Static method to find active paths for user
LearningPathSchema.statics.findActivePaths = function (userId) {
  return this.find({
    createdBy: userId,
    status: "active",
  }).sort({ "progress.last_activity": -1 })
}

// Compound indexes for efficient queries
LearningPathSchema.index({ createdBy: 1, status: 1 })
LearningPathSchema.index({ createdBy: 1, updatedAt: -1 })
LearningPathSchema.index({ status: 1, expectedEndDate: 1 })

// Create and export the model
const LearningPath = mongoose.model("LearningPath", LearningPathSchema)

export default LearningPath
