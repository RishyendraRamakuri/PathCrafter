"use client"

import { useState, useEffect, useCallback } from "react"

export const useProgressTracker = (pathId) => {
  const [progressData, setProgressData] = useState({})
  const [loading, setLoading] = useState(false)

  // Load progress from backend when component mounts
  useEffect(() => {
    if (pathId) {
      loadProgressFromBackend()
    }
  }, [pathId])

  const loadProgressFromBackend = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`https://pathcrafter-backend.onrender.com/api/learning-paths/${pathId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const pathData = await response.json()

        // Convert backend progress data to frontend format
        const frontendProgress = {}

        if (pathData.progress?.week_progress) {
          for (const [weekNum, weekProgress] of Object.entries(pathData.progress.week_progress)) {
            frontendProgress[weekNum] = {
              resources: {},
              objectives: {},
              progress: weekProgress.progress_percentage || 0,
            }

            // Convert resource completions to frontend format
            if (weekProgress.resources_completed) {
              weekProgress.resources_completed.forEach((resourceId) => {
                frontendProgress[weekNum].resources[resourceId] = true
              })
            }

            // Convert objective completions to frontend format
            if (weekProgress.objectives_completed) {
              weekProgress.objectives_completed.forEach((objectiveId) => {
                frontendProgress[weekNum].objectives[objectiveId] = true
              })
            }
          }
        }

        setProgressData(frontendProgress)
        console.log("Loaded progress from backend:", frontendProgress)
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateWeekProgress = useCallback(
    async (weekNumber, newProgressData) => {
      try {
        // Update local state immediately for responsive UI
        setProgressData((prev) => ({
          ...prev,
          [weekNumber]: {
            ...prev[weekNumber],
            ...newProgressData,
          },
        }))

        // Prepare data for backend
        const resourcesCompleted = Object.keys(newProgressData.resources || {}).filter(
          (key) => newProgressData.resources[key],
        )

        const objectivesCompleted = Object.keys(newProgressData.objectives || {}).filter(
          (key) => newProgressData.objectives[key],
        )

        // Send to backend
        const token = localStorage.getItem("token")
        const response = await fetch(
          `https://pathcrafter-backend.onrender.com/api/learning-paths/${pathId}/weeks/${weekNumber}/progress`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resourcesCompleted,
              objectivesCompleted,
              progressPercentage: newProgressData.progress || 0,
            }),
          },
        )

        if (!response.ok) {
          console.warn("Failed to save progress to backend")
          // Could implement retry logic here
        } else {
          console.log("Progress saved to backend successfully")
        }
      } catch (error) {
        console.error("Error updating week progress:", error)
      }
    },
    [pathId],
  )

  const completeWeek = useCallback(
    async (weekNumber, completionData) => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `https://pathcrafter-backend.onrender.com/api/learning-paths/${pathId}/weeks/${weekNumber}/complete`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(completionData),
          },
        )

        if (response.ok) {
          // Reload progress after completion
          await loadProgressFromBackend()
          return true
        }
        return false
      } catch (error) {
        console.error("Error completing week:", error)
        return false
      }
    },
    [pathId],
  )

  return {
    progressData,
    loading,
    updateWeekProgress,
    completeWeek,
    reloadProgress: loadProgressFromBackend,
  }
}
