import express from "express"
import protect from "../middleware/authMiddleware.js"
import {
  createLearningPath,
  getAllLearningPaths,
  getLearningPathById,
  deleteLearningPath,
  updateLearningPath,
  // Enhanced progress tracking functions
  trackActivity,
  updateWeekProgress,
  getAnalytics,
  completeWeek,
  logSession,
} from "../controllers/learningPathController.js"

// Create Express router
const router = express.Router()

// Routes for /api/learning-paths
router
  .route("/")
  .post(protect, createLearningPath) // Create a new learning path
  .get(protect, getAllLearningPaths) // Get all learning paths for the user

// Routes for /api/learning-paths/:id
router
  .route("/:id")
  .get(protect, getLearningPathById) // Get a specific learning path
  .put(protect, updateLearningPath) // Update a specific learning path
  .delete(protect, deleteLearningPath) // Delete a specific learning path

// Enhanced progress tracking routes
router.post("/:id/track-activity", protect, trackActivity)
router.put("/:id/weeks/:weekNumber/progress", protect, updateWeekProgress)
router.get("/:id/analytics", protect, getAnalytics)
router.put("/:id/weeks/:weekNumber/complete", protect, completeWeek)
router.post("/:id/log-session", protect, logSession)

export default router
