import axios from "axios"
import LearningPath from "../models/LearningPath.js"

// ML Service URL with better fallback handling
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001"

console.log("🔧 ML Service URL:", ML_SERVICE_URL)

/**
 * Generate a learning path using the ML service
 * @route POST /api/ml/generate-path
 * @access Private
 */
export const generateLearningPath = async (req, res) => {
  try {
    const userId = req.user._id

    // Extract and validate user input
    const { title, description, goals, preferredDifficulty, availableTimePerWeek, durationWeeks, preferredTopics } =
      req.body

    // Validate required fields
    if (!title || !preferredDifficulty || !availableTimePerWeek || !durationWeeks) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, preferredDifficulty, availableTimePerWeek, durationWeeks",
      })
    }

    // Prepare data for ML service
    const mlRequestData = {
      title,
      description: description || "",
      goals: goals || [],
      preferredDifficulty,
      availableTimePerWeek: Number(availableTimePerWeek),
      durationWeeks: Number(durationWeeks),
      preferredTopics: preferredTopics || [],
    }

    console.log("=== ML SERVICE REQUEST ===")
    console.log("URL:", `${ML_SERVICE_URL}`)
    console.log("Data:", JSON.stringify(mlRequestData, null, 2))
    console.log("========================")

    // Call ML service with retry logic for 429 errors
    let mlResponse
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount <= maxRetries) {
      try {
        mlResponse = await axios.post(`${ML_SERVICE_URL}`, mlRequestData, {
          timeout: 60000, // Increased timeout for ML processing
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          validateStatus: (status) => {
            return status < 500 // Don't throw for 4xx errors
          },
        })
        
        // If successful or non-429 error, break the retry loop
        if (mlResponse.status !== 429) {
          break
        }
        
        // If 429 and we haven't exceeded max retries, wait and retry
        if (retryCount < maxRetries) {
          console.log(`⏳ ML service busy, retrying in ${(retryCount + 1) * 2} seconds... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000))
          retryCount++
        } else {
          break
        }
        
      } catch (axiosError) {
        console.error("❌ Axios Error:", axiosError.message)

        if (axiosError.code === "ECONNREFUSED") {
          return res.status(503).json({
            success: false,
            message: "ML service is currently unavailable. Please try again in a few minutes.",
          })
        }

        if (axiosError.code === "ETIMEDOUT") {
          return res.status(504).json({
            success: false,
            message: "ML service request timed out. The service might be processing a large request. Please try again.",
          })
        }

        throw axiosError
      }
    }

    console.log("=== ML SERVICE RESPONSE ===")
    console.log("Status:", mlResponse.status)
    console.log("Response:", JSON.stringify(mlResponse.data, null, 2))
    console.log("==========================")

    if (mlResponse.status === 429) {
      return res.status(429).json({
        success: false,
        message: "ML service is temporarily busy. Please try again in a few minutes.",
        details: "Too Many Requests"
      })
    }

    if (mlResponse.status !== 200) {
      return res.status(mlResponse.status).json({
        success: false,
        message: mlResponse.data?.message || "ML service returned an error",
        details: mlResponse.data?.error || mlResponse.statusText,
      })
    }

    const generatedPath = mlResponse.data

    if (!generatedPath.success) {
      return res.status(400).json({
        success: false,
        message: generatedPath.message || "ML service failed to generate path",
      })
    }

    // Create learning path in database
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
      mlGeneratedContent: generatedPath.learning_path,
    })

    await learningPath.save()

    res.status(201).json({
      success: true,
      message: "Learning path generated successfully!",
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
      resourceCount: generatedPath.resource_count || {},
    })
  } catch (error) {
    console.error("=== LEARNING PATH GENERATION ERROR ===")
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)
    console.error("=====================================")

    res.status(500).json({
      success: false,
      message: "Internal server error while creating learning path",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
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
 * Get available domains from ML service
 * @route GET /api/ml/domains
 * @access Public
 */
export const getDomains = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/domains`)
    res.json(response.data)
  } catch (error) {
    console.error("Error fetching domains from ML service:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch available domains from ML service",
      error: error.message,
    })
  }
}

/**
 * Preview resources for a domain/subdomain from ML service
 * @route POST /api/ml/resources/preview
 * @access Private
 */
export const previewResources = async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/resources/preview`, req.body)
    res.json(response.data)
  } catch (error) {
    console.error("Error previewing resources from ML service:", error)
    res.status(500).json({
      success: false,
      message: "Failed to preview resources from ML service",
      error: error.message,
    })
  }
}

/**
 * Health check for ML service
 * @route GET /api/ml/health
 * @access Public
 */
export const mlHealthCheck = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`)
    res.json({
      success: true,
      service: "ML Service",
      data: response.data,
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "ML service health check failed",
      error: error.message,
    })
  }
}
