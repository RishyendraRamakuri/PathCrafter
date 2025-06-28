import dotenv from "dotenv"

dotenv.config()

export const config = {
  // Database
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/pathcrafter",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  jwtExpire: process.env.JWT_EXPIRE || "30d",

  // Server
  port: Number.parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // ML Service
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  mlServiceTimeout: Number.parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000,

  // Rate Limiting
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Security
  bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Computed properties
  get isDevelopment() {
    return this.nodeEnv === "development"
  },

  get isProduction() {
    return this.nodeEnv === "production"
  },
}
