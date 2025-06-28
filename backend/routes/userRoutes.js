import express from "express"
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserSettings,
  deleteUser,
} from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js"
import { validateUserRegistration, validateUserLogin } from "../middleware/validation.js"
import { authLimiter, generalLimiter } from "../middleware/rateLimiter.js"

const router = express.Router()

// Public routes with auth rate limiting
router.post("/register", authLimiter, validateUserRegistration, registerUser)
router.post("/login", authLimiter, validateUserLogin, loginUser)

// Protected routes
router.use(protect)
router.use(generalLimiter)

router.get("/profile", getUserProfile)
router.put("/profile", updateUserSettings)
router.delete("/profile", deleteUser)

export default router
