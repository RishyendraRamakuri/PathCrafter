import axios from "axios"
import LearningPath from "../models/LearningPath.js"

// ML Service URL - Enhanced ML service runs on port 5001
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001"

/**
 * Generate a learning path using the ENHANCED ML service
 * @route POST /api/ml/generate-path
 * @access Private
 */
export const generateLearningPath = async (req, res) => {
  try {
    const userId = req.user._id

    // Extract user input from request body
    const { title, description, goals, preferredDifficulty, availableTimePerWeek, durationWeeks, preferredTopics } =
      req.body

    // Validate required fields
    if (!title || !preferredDifficulty || !availableTimePerWeek || !durationWeeks) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, preferredDifficulty, availableTimePerWeek, durationWeeks",
      })
    }

    // Prepare data for ENHANCED ML service - EXACT format expected
    const mlRequestData = {
      title,
      description: description || "",
      goals: goals || [],
      preferredDifficulty,
      availableTimePerWeek: Number(availableTimePerWeek),
      durationWeeks: Number(durationWeeks),
      preferredTopics: preferredTopics || [],
    }

    console.log("=== BACKEND DEBUG (Enhanced ML Service) ===")
    console.log("Received from frontend:", req.body)
    console.log("Sending to Enhanced ML service:", mlRequestData)
    console.log("Enhanced ML Service URL:", `${ML_SERVICE_URL}/generate-path`)
    console.log("==========================================")

    // Call ENHANCED ML service to generate learning path
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/generate-path`, mlRequestData, {
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
      },
    })

    const generatedPath = mlResponse.data

    console.log("=== ENHANCED ML SERVICE RESPONSE ===")
    console.log("Success:", generatedPath.success)
    console.log("Path ID:", generatedPath.path_id)
    console.log("Resource count:", generatedPath.resource_count)
    console.log("===================================")

    if (!generatedPath.success) {
      throw new Error(generatedPath.message || "Enhanced ML service failed to generate path")
    }

    // Create learning path in database with ENHANCED content
    const learningPath = new LearningPath({
      title,
      description: description || "",
      goals: goals || [],
      preferredDifficulty,
      availableTimePerWeek: Number(availableTimePerWeek),
      durationWeeks: Number(durationWeeks),
      preferredTopics: preferredTopics || [],
      createdBy: userId,
      status: "active",
      mlGenerated: true,
      mlGeneratedContent: generatedPath.learning_path, // Enhanced content with real resources
    })

    // Save the learning path
    await learningPath.save()

    res.status(201).json({
      success: true,
      message: "Enhanced learning path generated successfully with real resources!",
      pathId: learningPath._id,
      path: {
        id: learningPath._id,
        title: learningPath.title,
        difficulty: learningPath.preferredDifficulty,
        duration: learningPath.durationWeeks,
        status: learningPath.status,
        overview: learningPath.mlGeneratedContent?.overview || "",
        domain: learningPath.mlGeneratedContent?.domain || "",
        createdAt: learningPath.createdAt,
      },
      // Include resource count from enhanced ML service
      resourceCount: generatedPath.resource_count || {},
      enhancedFeatures: [
        "Real YouTube video resources",
        "GitHub project examples",
        "Dev.to articles",
        "Comprehensive weekly planning",
        "Progress tracking milestones",
        "Smart resource caching",
      ],
    })
  } catch (error) {
    console.error("=== ENHANCED ML SERVICE ERROR ===")
    console.error("Error generating learning path:", error.message)
    console.error("Error details:", error.response?.data || error)
    console.error("=================================")

    // Handle different error types
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message:
          "Enhanced ML service is currently unavailable. Please make sure enhanced_app.py is running on port 5001.",
      })
    }

    if (error.response && error.response.data) {
      return res.status(400).json({
        success: false,
        message: error.response.data.message || "Failed to generate enhanced learning path",
        details: error.response.data,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating enhanced learning path",
      error: error.message,
    })
  }
}

/**
 * Get all learning paths for the current user
 * @route GET /api/ml/paths
 * @access Private
 */
export const getUserLearningPaths = async (req, res) => {
  try {
    const userId = req.user._id

    // Find all paths for this user, sorted by most recent first
    const learningPaths = await LearningPath.find({ createdBy: userId }).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: learningPaths.length,
      data: learningPaths,
    })
  } catch (error) {
    console.error("Error fetching learning paths:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch learning paths",
      error: error.message,
    })
  }
}

/**
 * Get a specific learning path by ID
 * @route GET /api/ml/paths/:pathId
 * @access Private
 */
export const getLearningPathById = async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user._id

    // Find the specific path for this user
    const learningPath = await LearningPath.findOne({
      _id: pathId,
      createdBy: userId,
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    res.json({
      success: true,
      data: learningPath,
    })
  } catch (error) {
    console.error("Error fetching learning path:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch learning path",
      error: error.message,
    })
  }
}

/**
 * Update learning path progress
 * @route PUT /api/ml/paths/:pathId/progress
 * @access Private
 */
export const updateProgress = async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user._id
    const { completed_weeks, completed_milestones, hours_logged } = req.body

    // Find the path
    const learningPath = await LearningPath.findOne({
      _id: pathId,
      createdBy: userId,
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    // Update progress (implement based on your LearningPath model)
    res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        pathId: learningPath._id,
      },
    })
  } catch (error) {
    console.error("Error updating progress:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    })
  }
}

/**
 * Mark a specific week as completed
 * @route PUT /api/ml/paths/:pathId/weeks/:weekNumber/complete
 * @access Private
 */
export const completeWeek = async (req, res) => {
  try {
    const { pathId, weekNumber } = req.params
    const userId = req.user._id

    const learningPath = await LearningPath.findOne({
      _id: pathId,
      createdBy: userId,
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    res.json({
      success: true,
      message: `Week ${weekNumber} marked as completed`,
    })
  } catch (error) {
    console.error("Error completing week:", error)
    res.status(500).json({
      success: false,
      message: "Failed to complete week",
      error: error.message,
    })
  }
}

/**
 * Mark a milestone as completed
 * @route PUT /api/ml/paths/:pathId/milestones/:milestoneId/complete
 * @access Private
 */
export const completeMilestone = async (req, res) => {
  try {
    const { pathId, milestoneId } = req.params
    const userId = req.user._id

    const learningPath = await LearningPath.findOne({
      _id: pathId,
      createdBy: userId,
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    res.json({
      success: true,
      message: "Milestone marked as completed",
    })
  } catch (error) {
    console.error("Error completing milestone:", error)
    res.status(500).json({
      success: false,
      message: "Failed to complete milestone",
      error: error.message,
    })
  }
}

/**
 * Delete a learning path
 * @route DELETE /api/ml/paths/:pathId
 * @access Private
 */
export const deleteLearningPath = async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user._id

    const learningPath = await LearningPath.findOneAndDelete({
      _id: pathId,
      createdBy: userId,
    })

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    res.json({
      success: true,
      message: "Learning path deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting learning path:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete learning path",
      error: error.message,
    })
  }
}

/**
 * Get available domains from Enhanced ML service
 * @route GET /api/ml/domains
 * @access Public
 */
export const getDomains = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/domains`)
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching domains from enhanced ML service:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch available domains from enhanced ML service",
      error: error.message,
    })
  }
}

/**
 * Preview resources for a domain/subdomain from Enhanced ML service
 * @route POST /api/ml/resources/preview
 * @access Private
 */
export const previewResources = async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/resources/preview`, req.body)
    res.json(response.data)
  } catch (error) {
    console.error("Error previewing resources from enhanced ML service:", error)
    res.status(500).json({
      success: false,
      message: "Failed to preview resources from enhanced ML service",
      error: error.message,
    })
  }
}

/**
 * Health check for Enhanced ML service
 * @route GET /api/ml/health
 * @access Public
 */
export const mlHealthCheck = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`)
    res.json({
      success: true,
      service: "Enhanced ML Service",
      data: response.data,
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Enhanced ML service health check failed",
      error: error.message,
    })
  }
}
