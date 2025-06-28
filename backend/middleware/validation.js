import { body, param, query, validationResult } from "express-validator"

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User validation rules
export const validateUserRegistration = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors,
]

export const validateUserLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

// Learning path validation rules
export const validateLearningPathCreation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("goals").isArray({ min: 1 }).withMessage("At least one goal is required"),
  body("goals.*").trim().isLength({ min: 3, max: 200 }).withMessage("Each goal must be between 3 and 200 characters"),
  body("preferredDifficulty")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),
  body("availableTimePerWeek")
    .isInt({ min: 1, max: 40 })
    .withMessage("Available time per week must be between 1 and 40 hours"),
  body("durationWeeks").isInt({ min: 1, max: 52 }).withMessage("Duration must be between 1 and 52 weeks"),
  body("preferredTopics").optional().isArray().withMessage("Preferred topics must be an array"),
  handleValidationErrors,
]

// Progress validation rules
export const validateProgressUpdate = [
  body("hours_spent").optional().isFloat({ min: 0, max: 40 }).withMessage("Hours spent must be between 0 and 40"),
  body("completion_percentage")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Completion percentage must be between 0 and 100"),
  body("notes").optional().trim().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
  handleValidationErrors,
]

// Parameter validation
export const validateObjectId = [
  param("pathId").isMongoId().withMessage("Invalid learning path ID"),
  handleValidationErrors,
]

export const validateWeekNumber = [
  param("weekNumber").isInt({ min: 1, max: 52 }).withMessage("Week number must be between 1 and 52"),
  handleValidationErrors,
]

// Query validation
export const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
]
