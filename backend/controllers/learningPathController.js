import LearningPath from "../models/LearningPath.js"
import asyncHandler from "express-async-handler"

// @desc    Create a new learning path
// @route   POST /api/learning-paths
// @access  Private
export const createLearningPath = asyncHandler(async (req, res) => {
  const { title, description, courses, difficulty, estimatedCompletionTime } = req.body

  // Validate required fields
  if (!title) {
    res.status(400)
    throw new Error("Title is required")
  }

  try {
    // Create new learning path
    const learningPath = await LearningPath.create({
      title,
      description,
      courses: courses || [],
      difficulty: difficulty || "Beginner",
      estimatedCompletionTime: estimatedCompletionTime || 0,
      createdBy: req.user._id,
      isPublic: req.body.isPublic || false,
    })

    res.status(201).json(learningPath)
  } catch (error) {
    console.error("Create learning path error:", error)
    res.status(400)
    throw new Error("Invalid learning path data")
  }
})

// @desc    Get all learning paths for the logged-in user
// @route   GET /api/learning-paths
// @access  Private
export const getAllLearningPaths = asyncHandler(async (req, res) => {
  try {
    // Find all learning paths created by the logged-in user
    const learningPaths = await LearningPath.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 }) // Sort by most recent first

    res.status(200).json(learningPaths)
  } catch (error) {
    console.error("Get all learning paths error:", error)
    res.status(500)
    throw new Error("Unable to fetch learning paths")
  }
})

// @desc    Get a single learning path by ID
// @route   GET /api/learning-paths/:id
// @access  Private
export const getLearningPathById = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching learning path with ID:", req.params.id)
    console.log("User ID:", req.user._id)

    // Find learning path by ID and ensure it belongs to the user
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      console.log("Learning path not found")
      res.status(404)
      throw new Error("Learning path not found")
    }

    console.log("Found learning path:", learningPath.title)
    res.status(200).json(learningPath)
  } catch (error) {
    console.error("Get learning path by ID error:", error)
    res.status(500)
    throw new Error("Learning path not found")
  }
})

// @desc    Delete a learning path
// @route   DELETE /api/learning-paths/:id
// @access  Private
export const deleteLearningPath = asyncHandler(async (req, res) => {
  try {
    // Find and delete the learning path, ensuring user ownership
    const learningPath = await LearningPath.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      res.status(404)
      throw new Error("Learning path not found")
    }

    res.status(200).json({
      message: "Learning path deleted successfully",
      deletedPath: learningPath,
    })
  } catch (error) {
    console.error("Delete learning path error:", error)
    res.status(404)
    throw new Error("Learning path not found or could not be deleted")
  }
})

// Optional: Update Learning Path
export const updateLearningPath = asyncHandler(async (req, res) => {
  const { title, description, courses, difficulty, estimatedCompletionTime, isPublic } = req.body

  try {
    const learningPath = await LearningPath.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id,
      },
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(courses && { courses }),
        ...(difficulty && { difficulty }),
        ...(estimatedCompletionTime && { estimatedCompletionTime }),
        ...(isPublic !== undefined && { isPublic }),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run model validation
      },
    )

    if (!learningPath) {
      res.status(404)
      throw new Error("Learning path not found")
    }

    res.status(200).json(learningPath)
  } catch (error) {
    console.error("Update learning path error:", error)
    res.status(400)
    throw new Error("Could not update learning path")
  }
})

// ========================================
// ENHANCED: Progress Tracking Functions
// ========================================

// @desc    Track resource interactions and activities
// @route   POST /api/learning-paths/:id/track-activity
// @access  Private
export const trackActivity = asyncHandler(async (req, res) => {
  const { resourceId, interactionType, duration, timestamp } = req.body

  try {
    console.log("Tracking activity for path:", req.params.id)
    console.log("User:", req.user._id)
    console.log("Activity data:", { resourceId, interactionType })

    // Find learning path by ID and ensure it belongs to the user
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      console.log("Learning path not found for activity tracking")
      res.status(404)
      throw new Error("Learning path not found")
    }

    // Track the resource interaction
    await learningPath.trackResourceInteraction(resourceId, interactionType, duration)

    console.log("Activity tracked successfully")
    res.status(200).json({
      success: true,
      message: "Activity tracked successfully",
      data: { resourceId, interactionType, timestamp },
    })
  } catch (error) {
    console.error("Track activity error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while tracking activity",
      error: error.message,
    })
  }
})

// @desc    Update week progress (resources, objectives)
// @route   PUT /api/learning-paths/:id/weeks/:weekNumber/progress
// @access  Private
export const updateWeekProgress = asyncHandler(async (req, res) => {
  const { weekNumber } = req.params
  const { resourcesCompleted, objectivesCompleted, progressPercentage } = req.body

  try {
    console.log("Updating week progress:", weekNumber, "for path:", req.params.id)

    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      res.status(404)
      throw new Error("Learning path not found")
    }

    // Update week progress
    await learningPath.updateWeekProgress(Number.parseInt(weekNumber), {
      resources_completed: resourcesCompleted || [],
      objectives_completed: objectivesCompleted || [],
      progress_percentage: progressPercentage || 0,
    })

    res.status(200).json({
      success: true,
      message: "Week progress updated successfully",
      data: {
        weekNumber: Number.parseInt(weekNumber),
        progress: learningPath.progress.week_progress.get(weekNumber),
      },
    })
  } catch (error) {
    console.error("Update week progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating week progress",
      error: error.message,
    })
  }
})

// @desc    Get activity analytics for a learning path
// @route   GET /api/learning-paths/:id/analytics
// @access  Private
export const getAnalytics = asyncHandler(async (req, res) => {
  try {
    console.log("Getting analytics for path:", req.params.id)
    console.log("User:", req.user._id)

    // Find learning path by ID and ensure it belongs to the user
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      console.log("Learning path not found for analytics")
      res.status(404)
      throw new Error("Learning path not found")
    }

    // Generate analytics from stored progress data
    const weekProgress = {}
    if (learningPath.progress.week_progress) {
      for (const [weekNum, progress] of learningPath.progress.week_progress) {
        weekProgress[weekNum] = progress.progress_percentage || 0
      }
    }

    const analytics = {
      lastActivity: learningPath.progress?.last_activity || learningPath.updatedAt,
      weekProgress: weekProgress,
      totalSessions: learningPath.progress?.sessions?.length || 0,
      totalInteractions: learningPath.progress?.resource_interactions?.length || 0,
      averageSessionTime:
        learningPath.progress?.sessions?.length > 0
          ? learningPath.progress.sessions.reduce((sum, session) => sum + session.duration, 0) /
            learningPath.progress.sessions.length
          : 0,
    }

    console.log("Analytics generated successfully")
    res.status(200).json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
      error: error.message,
    })
  }
})

// @desc    Complete a week in the learning path
// @route   PUT /api/learning-paths/:id/weeks/:weekNumber/complete
// @access  Private
export const completeWeek = asyncHandler(async (req, res) => {
  const { weekNumber } = req.params
  const { hoursSpent, selfAssessment, reflectionNotes, confidence, autoProgress } = req.body

  try {
    console.log("Completing week:", weekNumber, "for path:", req.params.id)
    console.log("User:", req.user._id)

    // Find learning path by ID and ensure it belongs to the user
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      console.log("Learning path not found for week completion")
      res.status(404)
      throw new Error("Learning path not found")
    }

    // Complete the week using the model method
    await learningPath.completeWeek(Number.parseInt(weekNumber), {
      hoursSpent,
      selfAssessment,
      reflectionNotes,
      confidence,
    })

    console.log("Week completed successfully")
    res.status(200).json({
      success: true,
      message: "Week completed successfully",
      data: {
        weekNumber: Number.parseInt(weekNumber),
        completed: true,
        completedAt: new Date(),
        newProgress: learningPath.progress,
      },
    })
  } catch (error) {
    console.error("Complete week error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while completing week",
      error: error.message,
    })
  }
})

// @desc    Log a learning session
// @route   POST /api/learning-paths/:id/log-session
// @access  Private
export const logSession = asyncHandler(async (req, res) => {
  const { sessionStart, sessionEnd, duration, interactions } = req.body

  try {
    console.log("Logging session for path:", req.params.id)
    console.log("User:", req.user._id)
    console.log("Session duration:", duration)

    // Find learning path by ID and ensure it belongs to the user
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!learningPath) {
      console.log("Learning path not found for session logging")
      res.status(404)
      throw new Error("Learning path not found")
    }

    // Log the session using the model method
    await learningPath.logSession({
      sessionStart,
      sessionEnd,
      duration,
      interactionsCount: interactions?.length || 0,
    })

    console.log("Session logged successfully")
    res.status(200).json({
      success: true,
      message: "Session logged successfully",
      data: { duration, sessionEnd },
    })
  } catch (error) {
    console.error("Log session error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while logging session",
      error: error.message,
    })
  }
})
