"use client"

import { createContext, useState, useContext, useEffect } from "react"

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  // Initialize user as null, will be loaded from localStorage or API
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user data on app startup
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, check if user data exists in localStorage
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (storedUser && token) {
          // Parse stored user data
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Optionally, verify token is still valid by fetching fresh profile data
          await fetchUserProfile(token)
        }
      } catch (err) {
        console.error("Error loading user data:", err)
        // Clear invalid data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Fetch user profile from API
  const fetchUserProfile = async (token = null) => {
    try {
      const authToken = token || localStorage.getItem("token")

      if (!authToken) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const userData = await response.json()

      // Update user state and localStorage
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      return userData
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError(err.message)
      throw err
    }
  }

  // Login method
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout method
  const logout = () => {
    // Clear all user data
    setUser(null)
    setError(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  // Register method
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update user method
  const updateUser = (userData) => {
    const updatedUser = {
      ...user,
      ...userData,
    }

    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  // Refresh user profile
  const refreshProfile = async () => {
    try {
      await fetchUserProfile()
    } catch (err) {
      console.error("Error refreshing profile:", err)
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && localStorage.getItem("token"))
  }

  const contextValue = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    refreshProfile,
    isAuthenticated,
    fetchUserProfile,
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export default UserContext
