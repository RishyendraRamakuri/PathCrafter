// Dashboard API service
class DashboardService {
  static async getDashboardStats() {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:5000/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.json()
  }

  static async getRecentActivity() {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:5000/api/dashboard/activity", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.json()
  }

  static async getCurrentStreak() {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:5000/api/dashboard/streak", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    return response.json()
  }

  static async logActivity(activityData) {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:5000/api/dashboard/log-activity", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    })
    return response.json()
  }

  static async updatePathProgress(pathId, progressData) {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/paths/${pathId}/progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progressData),
    })
    return response.json()
  }
}

export default DashboardService
