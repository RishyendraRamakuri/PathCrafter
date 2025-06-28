"use client"

import { useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../common/UserContext"
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  Star,
  Calendar,
  Activity,
  CheckCircle,
  ArrowRight,
} from "react-bootstrap-icons"
import "./Hero.css"

function Hero() {
  const { user } = useContext(UserContext)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Mock user stats - replace with real data
  const userStats = {
    activePaths: user?.activePaths || 3,
    completedPaths: user?.completedPaths || 12,
    totalHours: user?.totalHours || 47,
    currentStreak: user?.currentStreak || 7,
    weeklyGoal: user?.weeklyGoal || 10,
    weeklyProgress: user?.weeklyProgress || 6,
    level: user?.level || "Intermediate",
    xp: user?.xp || 2450,
    nextLevelXp: user?.nextLevelXp || 3000,
  }

  const recentAchievements = [
    { id: 1, title: "React Master", icon: Award, color: "gold" },
    { id: 2, title: "7-Day Streak", icon: Star, color: "purple" },
    { id: 3, title: "Fast Learner", icon: TrendingUp, color: "blue" },
  ]

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Resume your current path",
      icon: BookOpen,
      link: "/dashboard",
      color: "primary",
    },
    {
      title: "Start New Path",
      description: "Explore new topics",
      icon: Target,
      link: "/create-path",
      color: "success",
    },
    {
      title: "View Progress",
      description: "Check your statistics",
      icon: Activity,
      link: "/progress",
      color: "info",
    },
  ]

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const progressPercentage = (userStats.weeklyProgress / userStats.weeklyGoal) * 100
  const xpPercentage = (userStats.xp / userStats.nextLevelXp) * 100

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-pattern"></div>
        <div className="hero-gradient"></div>
      </div>

      <div className="hero-container">
        {/* Main Hero Content */}
        <div className="hero-main">
          <div className="hero-text">
            <div className="hero-greeting">
              <span className="greeting-time">{getGreeting()}</span>
              <span className="greeting-emoji">👋</span>
            </div>

            <h1 className="hero-heading">
              Welcome back, <span className="user-name">{user?.name || "Learner"}</span>
            </h1>

            <p className="hero-subheading">
              Ready to continue your learning journey? You're doing amazing with{" "}
              <strong>{userStats.activePaths} active paths</strong> and a{" "}
              <strong>{userStats.currentStreak}-day streak</strong>! 🔥
            </p>

            {/* Quick Actions */}
            <div className="hero-actions">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link key={index} to={action.link} className={`hero-action-card ${action.color}`}>
                    <div className="action-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="action-content">
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                    <ArrowRight className="action-arrow" size={16} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Hero Stats Card */}
          <div className="hero-stats">
            <div className="stats-card">
              <div className="stats-header">
                <h3>Your Progress</h3>
                <div className="level-badge">
                  <Star size={16} />
                  <span>{userStats.level}</span>
                </div>
              </div>

              {/* XP Progress */}
              <div className="stat-item">
                <div className="stat-label">
                  <TrendingUp size={16} />
                  <span>Experience Points</span>
                </div>
                <div className="stat-value">
                  <span>{userStats.xp.toLocaleString()} XP</span>
                  <div className="progress-bar">
                    <div className="progress-fill xp" style={{ width: `${xpPercentage}%` }}></div>
                  </div>
                  <small>{userStats.nextLevelXp - userStats.xp} XP to next level</small>
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="stat-item">
                <div className="stat-label">
                  <Target size={16} />
                  <span>Weekly Goal</span>
                </div>
                <div className="stat-value">
                  <span>
                    {userStats.weeklyProgress}/{userStats.weeklyGoal} hours
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill weekly"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <small>
                    {progressPercentage >= 100
                      ? "🎉 Goal achieved!"
                      : `${userStats.weeklyGoal - userStats.weeklyProgress} hours remaining`}
                  </small>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-icon completed">
                    <CheckCircle size={20} />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-number">{userStats.completedPaths}</span>
                    <span className="quick-stat-label">Completed</span>
                  </div>
                </div>

                <div className="quick-stat">
                  <div className="quick-stat-icon active">
                    <BookOpen size={20} />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-number">{userStats.activePaths}</span>
                    <span className="quick-stat-label">Active</span>
                  </div>
                </div>

                <div className="quick-stat">
                  <div className="quick-stat-icon hours">
                    <Clock size={20} />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-number">{userStats.totalHours}</span>
                    <span className="quick-stat-label">Hours</span>
                  </div>
                </div>

                <div className="quick-stat">
                  <div className="quick-stat-icon streak">
                    <Calendar size={20} />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-number">{userStats.currentStreak}</span>
                    <span className="quick-stat-label">Day Streak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="achievements-card">
              <h4>Recent Achievements</h4>
              <div className="achievements-list">
                {recentAchievements.map((achievement) => {
                  const IconComponent = achievement.icon
                  return (
                    <div key={achievement.id} className={`achievement-item ${achievement.color}`}>
                      <div className="achievement-icon">
                        <IconComponent size={18} />
                      </div>
                      <span className="achievement-title">{achievement.title}</span>
                    </div>
                  )
                })}
              </div>
              <Link to="/achievements" className="view-all-link">
                View All Achievements <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-card card-1">
            <TrendingUp size={24} />
            <span>+15% this week</span>
          </div>
          <div className="floating-card card-2">
            <Award size={24} />
            <span>New badge!</span>
          </div>
          <div className="floating-card card-3">
            <Target size={24} />
            <span>Goal: 80%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
