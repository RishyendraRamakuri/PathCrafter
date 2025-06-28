"use client"

import { useState, useEffect } from "react"
import { Alert, Button, Card, Badge } from "react-bootstrap"
import { Lightbulb, Bullseye, Clock, GraphUp } from "react-bootstrap-icons"

const SmartProgressSuggestions = ({ pathId, currentWeek, activityData, onSuggestionAction }) => {
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    generateSuggestions()
  }, [currentWeek, activityData])

  const generateSuggestions = () => {
    const newSuggestions = []

    // Inactivity suggestion
    const lastActivity = activityData.lastActivity
    if (lastActivity && new Date() - new Date(lastActivity) > 3 * 24 * 60 * 60 * 1000) {
      newSuggestions.push({
        type: "inactivity",
        priority: "high",
        title: "Welcome back!",
        message: "You haven't been active for 3 days. Ready to continue your learning journey?",
        action: "Continue Learning",
        actionType: "resume",
      })
    }

    // Week completion suggestion
    const weekProgress = activityData.weekProgress?.[currentWeek] || 0
    if (weekProgress >= 80 && weekProgress < 100) {
      newSuggestions.push({
        type: "completion",
        priority: "medium",
        title: "Almost there!",
        message: `You're ${weekProgress}% done with Week ${currentWeek}. Finish strong!`,
        action: "Complete Week",
        actionType: "complete_week",
      })
    }

    // Pacing suggestion
    const averageWeeklyProgress =
      Object.values(activityData.weekProgress || {}).reduce((a, b) => a + b, 0) /
      Object.keys(activityData.weekProgress || {}).length
    if (averageWeeklyProgress < 50) {
      newSuggestions.push({
        type: "pacing",
        priority: "low",
        title: "Consider adjusting your pace",
        message: "You might benefit from spending more time on each topic. Quality over speed!",
        action: "Review Schedule",
        actionType: "adjust_schedule",
      })
    }

    // Resource recommendation
    if (weekProgress > 0 && weekProgress < 60) {
      newSuggestions.push({
        type: "resource",
        priority: "medium",
        title: "Need more resources?",
        message: "Explore additional learning materials to deepen your understanding.",
        action: "Browse Resources",
        actionType: "view_resources",
      })
    }

    setSuggestions(newSuggestions)
  }

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "inactivity":
        return <Clock className="text-warning" />
      case "completion":
        return <Bullseye className="text-success" />
      case "pacing":
        return <GraphUp className="text-info" />
      case "resource":
        return <Lightbulb className="text-primary" />
      default:
        return <Lightbulb className="text-secondary" />
    }
  }

  const getSuggestionVariant = (priority) => {
    switch (priority) {
      case "high":
        return "warning"
      case "medium":
        return "info"
      case "low":
        return "light"
      default:
        return "light"
    }
  }

  if (suggestions.length === 0) return null

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-light border-0">
        <h6 className="mb-0">
          <Lightbulb className="me-2 text-primary" />
          Smart Suggestions
        </h6>
      </Card.Header>
      <Card.Body className="p-0">
        {suggestions.map((suggestion, index) => (
          <Alert key={index} variant={getSuggestionVariant(suggestion.priority)} className="mb-0 border-0 rounded-0">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="me-3">{getSuggestionIcon(suggestion.type)}</div>
                <div>
                  <div className="fw-medium">{suggestion.title}</div>
                  <div className="small text-muted">{suggestion.message}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge
                  bg={
                    suggestion.priority === "high"
                      ? "danger"
                      : suggestion.priority === "medium"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {suggestion.priority}
                </Badge>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onSuggestionAction(suggestion.actionType, suggestion)}
                >
                  {suggestion.action}
                </Button>
              </div>
            </div>
          </Alert>
        ))}
      </Card.Body>
    </Card>
  )
}

export default SmartProgressSuggestions
