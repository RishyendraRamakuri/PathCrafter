import express from "express"
import {
  generateLearningPath,
  getUserLearningPaths,
  getLearningPathById,
  updateProgress,
  completeWeek,
  completeMilestone,
  deleteLearningPath,
  getDomains,
  previewResources,
  mlHealthCheck,
} from "../controllers/mlController.js"
import protect from "../middleware/authMiddleware.js"
import { mlLimiter } from "../middleware/rateLimiter.js"

const router = express.Router()

// Public routes
router.get("/health", mlHealthCheck)
router.get("/domains", getDomains)

// Apply authentication middleware to all routes below
router.use(protect)

// Generate a new learning path (with ML-specific rate limiting)
router.post("/generate-path", mlLimiter, generateLearningPath)

// Get all learning paths for the authenticated user
router.get("/paths", getUserLearningPaths)

// Preview resources
router.post("/resources/preview", previewResources)

// Get a specific learning path
router.get("/paths/:pathId", getLearningPathById)

// Update learning path progress
router.put("/paths/:pathId/progress", updateProgress)

// Mark a week as completed
router.put("/paths/:pathId/weeks/:weekNumber/complete", completeWeek)

// Mark a milestone as completed
router.put("/paths/:pathId/milestones/:milestoneId/complete", completeMilestone)

// Delete a learning path
router.delete("/paths/:pathId", deleteLearningPath)

export default router
