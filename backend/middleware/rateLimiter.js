import rateLimit from "express-rate-limit"

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// ML generation rate limiter (more restrictive)
export const mlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 ML requests per 5 minutes
  message: {
    success: false,
    message: "Too many learning path generation requests, please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export default generalLimiter
