// New API endpoints for enhanced progress tracking
const express = require("express")
const router = express.Router()
const ActivityLog = require("../models/ActivityLog") // Import ActivityLog model
const LearningSession = require("../models/LearningSession") // Import LearningSession model
const WeekCompletion = require("../models/WeekCompletion") // Import WeekCompletion model
const { updatePathProgress } = require("../utils/pathProgress") // Import updatePathProgress function
const { generateActivityAnalytics } = require("../utils/activityAnalytics") // Import generateActivityAnalytics function

// Track resource interactions
router.post("/paths/:pathId/track-activity", async (req, res) => {
  try {
    const { pathId } = req.params
    const { resourceId, interactionType, duration, timestamp } = req.body
    const userId = req.user.id

    // Save activity to database
    const activity = await ActivityLog.create({
      userId,
      pathId,
      resourceId,
      interactionType,
      duration,
      timestamp: new Date(timestamp),
    })

    res.json({ success: true, data: activity })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Log learning sessions
router.post("/paths/:pathId/log-session", async (req, res) => {
  try {
    const { pathId } = req.params
    const { sessionStart, sessionEnd, duration, interactions } = req.body
    const userId = req.user.id

    const session = await LearningSession.create({
      userId,
      pathId,
      sessionStart: new Date(sessionStart),
      sessionEnd: new Date(sessionEnd),
      duration,
      interactions: JSON.stringify(interactions),
    })

    res.json({ success: true, data: session })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Enhanced week completion with self-assessment
router.put("/paths/:pathId/weeks/:weekNumber/complete", async (req, res) => {
  try {
    const { pathId, weekNumber } = req.params
    const { hoursSpent, selfAssessment, reflectionNotes, confidence, autoProgress, completedAt } = req.body
    const userId = req.user.id

    // Update week completion with enhanced data
    const completion = await WeekCompletion.findOneAndUpdate(
      { userId, pathId, weekNumber: Number.parseInt(weekNumber) },
      {
        hoursSpent,
        selfAssessment: JSON.stringify(selfAssessment),
        reflectionNotes,
        confidence,
        autoProgress,
        completedAt: new Date(completedAt),
        completed: true,
      },
      { upsert: true, new: true },
    )

    // Update overall path progress
    await updatePathProgress(userId, pathId)

    res.json({ success: true, data: completion })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get activity analytics
router.get("/paths/:pathId/analytics", async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user.id

    const analytics = await generateActivityAnalytics(userId, pathId)
    res.json({ success: true, data: analytics })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
