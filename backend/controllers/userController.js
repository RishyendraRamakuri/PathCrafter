import jwt from "jsonwebtoken"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import asyncHandler from "express-async-handler"

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  })
}

// @desc    Register new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const user = await User.create({ name, email, password }) // password gets hashed by pre-save hook

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: "Registration failed" })
  }
}

// @desc    Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" })
  }

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  })
})

// @desc    Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching profile" })
  }
}

// @desc    Update user settings
export const updateUserSettings = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Destructure fields from request body
    const { name, email, password } = req.body

    // Check if email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
      }
      user.email = email
    }

    // Update name if provided
    if (name) user.name = name

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    // Save updated user
    await user.save()

    // Generate new token
    const token = generateToken(user._id)

    // Return updated user info
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete user account
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndDelete(req.user.id)

    res.json({ message: "User account deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}
