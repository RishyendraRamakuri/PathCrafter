"use client"

import { useState, useEffect, useCallback } from "react"

export const useActivityTracker = (pathId) => {
  const [sessionStart, setSessionStart] = useState(null)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [resourceInteractions, setResourceInteractions] = useState({})

  // Start learning session
  const startSession = useCallback(() => {
    setSessionStart(new Date())
  }, [])

  // End learning session
  const endSession = useCallback(async () => {
    if (!sessionStart) return

    const sessionDuration = (new Date() - sessionStart) / 1000 / 60 // minutes
    setTotalSessionTime((prev) => prev + sessionDuration)

    // Log session to backend
    try {
      const token = localStorage.getItem("token")
      // Updated API endpoint to match your backend
      await fetch(`http://localhost:5000/api/learning-paths/${pathId}/log-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionStart: sessionStart.toISOString(),
          sessionEnd: new Date().toISOString(),
          duration: sessionDuration,
          interactions: resourceInteractions,
        }),
      })
    } catch (err) {
      console.error("Error logging session:", err)
    }

    setSessionStart(null)
    setResourceInteractions({})
  }, [sessionStart, pathId, resourceInteractions])

  // Track resource interaction
  const trackInteraction = useCallback((resourceId, type, metadata = {}) => {
    setResourceInteractions((prev) => ({
      ...prev,
      [resourceId]: {
        ...prev[resourceId],
        [type]: {
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      },
    }))
  }, [])

  // Auto-end session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStart) {
        endSession()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [sessionStart, endSession])

  return {
    sessionStart,
    totalSessionTime,
    resourceInteractions,
    startSession,
    endSession,
    trackInteraction,
    isSessionActive: !!sessionStart,
  }
}
