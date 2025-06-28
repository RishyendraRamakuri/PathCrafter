"use client"

import { useState, useEffect } from "react"
import DashboardService from "../services/dashboardService"

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPaths: 0,
      activePaths: 0,
      completedPaths: 0,
      totalHoursSpent: 0,
      currentStreak: 0,
      weeklyProgress: 0,
    },
    activePaths: [],
    recentActivity: [],
    recommendations: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all dashboard data in parallel
      const [statsResponse, activityResponse, streakResponse] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getRecentActivity(),
        DashboardService.getCurrentStreak(),
      ])

      if (statsResponse.success && activityResponse.success && streakResponse.success) {
        setDashboardData({
          stats: {
            ...statsResponse.data.stats,
            currentStreak: streakResponse.data.currentStreak,
          },
          activePaths: statsResponse.data.activePaths,
          recentActivity: activityResponse.data.activities,
          recommendations: generateRecommendations(statsResponse.data.activePaths),
        })
      } else {
        setError("Failed to fetch dashboard data")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (activityData) => {
    try {
      await DashboardService.logActivity(activityData)
      // Refresh dashboard data after logging activity
      fetchDashboardData()
    } catch (err) {
      console.error("Error logging activity:", err)
    }
  }

  const updateProgress = async (pathId, progressData) => {
    try {
      await DashboardService.updatePathProgress(pathId, progressData)
      // Refresh dashboard data after updating progress
      fetchDashboardData()
    } catch (err) {
      console.error("Error updating progress:", err)
    }
  }

  const generateRecommendations = (activePaths) => {
    const recommendations = []

    activePaths.forEach((path) => {
      const progress = path.progress?.completion_percentage || 0

      if (progress > 0 && progress < 100) {
        recommendations.push({
          type: "continue",
          title: `Continue ${path.title}`,
          description: `You're ${progress}% complete. Keep the momentum going!`,
          action: "Continue Learning",
          pathId: path._id,
          priority: progress > 50 ? "high" : "medium",
        })
      }

      if (progress > 80) {
        recommendations.push({
          type: "finish",
          title: `Finish ${path.title}`,
          description: `You're almost done! Just ${100 - progress}% left to complete.`,
          action: "Finish Path",
          pathId: path._id,
          priority: "high",
        })
      }
    })

    if (activePaths.length === 0) {
      recommendations.push({
        type: "start",
        title: "Start Your Learning Journey",
        description: "Create your first personalized learning path to begin.",
        action: "Create Path",
        priority: "high",
      })
    }

    return recommendations.slice(0, 3)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard: fetchDashboardData,
    logActivity,
    updateProgress,
  }
}
