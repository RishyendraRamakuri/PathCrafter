import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import mongoose from "mongoose"
import { config } from "./config/env.js"

// Import routes
import userRoutes from "./routes/userRoutes.js"
import learningPathRoutes from "./routes/learningPathRoutes.js"
import mlRoutes from "./routes/mlRoutes.js"

// Import middleware
import { generalLimiter } from "./middleware/rateLimiter.js"

// Connect to MongoDB with proper error handling
try {
  await mongoose.connect(process.env.MONGO_URI || config.mongoUri)
  console.log("✅ MongoDB connected successfully")
} catch (error) {
  console.error("❌ MongoDB connection error:", error)
  process.exit(1)
}

// Initialize Express app
const app = express()

// Trust proxy for Render deployment (fixes rate limiting issues)
app.set('trust proxy', 1)

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://path-crafter-alpha.vercel.app",
            "https://path-crafter-21.vercel.app",
          ]
        : process.env.FRONTEND_URL,
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Apply general rate limiting
app.use(generalLimiter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "PathCrafter API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PathCrafter Backend API",
    status: "running",
  })
})

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/learning-paths", learningPathRoutes)
app.use("/api/ml", mlRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack)

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})

// Start the server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

// FIXED: Graceful shutdown without deprecated callback
const gracefulShutdown = async (signal) => {
  console.log(`\n📡 Received ${signal}. Shutting down gracefully...`)

  server.close(() => {
    console.log("✅ HTTP server closed")
  })

  try {
    // FIXED: Use await instead of callback
    await mongoose.connection.close()
    console.log("✅ MongoDB connection closed")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error closing MongoDB:", error)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`)
  process.exit(1)
})

export default app
