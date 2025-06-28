"use client"

import { useState } from "react"
import { Card, ProgressBar, Button, Modal, Form, Badge, Alert, ListGroup } from "react-bootstrap"
import { CheckCircle, Clock, Trophy, Lightbulb, Bullseye, BookmarkCheck } from "react-bootstrap-icons"
import { useProgressTracker } from "../../hooks/useProgressTracker"
import { useActivityTracker } from "../../hooks/useActivityTracker"

const ProgressTracker = ({ pathId, weekData, onProgressUpdate }) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [completionData, setCompletionData] = useState({
    hoursSpent: "",
    completedActivities: [],
    selfAssessment: {},
    reflectionNotes: "",
    confidence: 3,
  })
  const [loading, setLoading] = useState(false)

  // Use both hooks - your activity tracker for sessions and my progress tracker for persistence
  const { trackInteraction } = useActivityTracker(pathId)
  const {
    progressData,
    loading: progressLoading,
    updateWeekProgress,
    completeWeek,
    reloadProgress,
  } = useProgressTracker(pathId)

  // Calculate progress for a specific week
  const calculateWeekProgress = (week) => {
    const weekProgress = progressData[week.week]
    if (!weekProgress) return 0

    // Use stored progress if available
    if (weekProgress.progress !== undefined) {
      return weekProgress.progress
    }

    // Otherwise calculate from interactions
    const totalResources = week.resources_needed?.length || 0
    const totalObjectives = week.learning_objectives?.length || 0
    const totalItems = totalResources + totalObjectives

    if (totalItems === 0) return 0

    const completedResources = Object.values(weekProgress.resources || {}).filter(Boolean).length
    const completedObjectives = Object.values(weekProgress.objectives || {}).filter(Boolean).length
    const completedItems = completedResources + completedObjectives

    return Math.min(Math.round((completedItems / totalItems) * 100), 100)
  }

  // Check if week is ready for completion
  const isWeekReadyForCompletion = (week) => {
    const progress = calculateWeekProgress(week)
    return progress >= 50 // At least 50% interaction
  }

  const handleWeekCompletion = (week) => {
    setSelectedWeek(week)
    setCompletionData({
      hoursSpent: "",
      completedActivities: [],
      selfAssessment: {},
      reflectionNotes: "",
      confidence: 3,
    })
    setShowCompletionModal(true)
  }

  const submitWeekCompletion = async () => {
    if (!selectedWeek || !completionData.hoursSpent) {
      alert("Please fill in the required fields")
      return
    }

    try {
      setLoading(true)

      const success = await completeWeek(selectedWeek.week, {
        ...completionData,
        autoProgress: calculateWeekProgress(selectedWeek),
        completedAt: new Date().toISOString(),
      })

      if (success) {
        onProgressUpdate() // Refresh parent component
        setShowCompletionModal(false)
        alert("Week completed successfully!")
      } else {
        alert("Failed to complete week. Please try again.")
      }
    } catch (err) {
      console.error("Error completing week:", err)
      alert("Error completing week. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle resource clicks with both activity tracking and progress persistence
  const handleResourceClick = async (resource, week, idx) => {
    const resourceKey = resource.id || `resource_${idx}`

    console.log("Resource clicked:", { resourceKey, week: week.week })

    // Track interaction using your activity tracker
    trackInteraction(resourceKey, "viewed", {
      resourceType: resource.type,
      url: resource.url,
      weekNumber: week.week,
    })

    // Update progress data for persistence
    const currentWeekProgress = progressData[week.week] || { resources: {}, objectives: {}, progress: 0 }
    const newWeekProgress = {
      ...currentWeekProgress,
      resources: {
        ...currentWeekProgress.resources,
        [resourceKey]: true,
      },
    }

    // Calculate new progress percentage
    const totalResources = week.resources_needed?.length || 0
    const totalObjectives = week.learning_objectives?.length || 0
    const totalItems = totalResources + totalObjectives

    if (totalItems > 0) {
      const completedResources = Object.values(newWeekProgress.resources).filter(Boolean).length
      const completedObjectives = Object.values(newWeekProgress.objectives).filter(Boolean).length
      const completedItems = completedResources + completedObjectives
      newWeekProgress.progress = Math.min(Math.round((completedItems / totalItems) * 100), 100)
    }

    // Update progress using the progress tracker hook
    await updateWeekProgress(week.week, newWeekProgress)

    // Open resource if URL exists
    if (resource.url) {
      window.open(resource.url, "_blank")
    }
  }

  // Handle objective checkbox with immediate state update and backend sync
  const handleObjectiveCheck = async (week, idx, checked) => {
    const objectiveKey = `objective_${idx}`

    console.log("Objective checkbox changed:", {
      week: week.week,
      idx,
      objectiveKey,
      checked,
    })

    // Track interaction using your activity tracker
    trackInteraction(objectiveKey, checked ? "completed" : "unchecked", {
      weekNumber: week.week,
      objective: week.learning_objectives[idx],
    })

    // Update progress data for persistence
    const currentWeekProgress = progressData[week.week] || { resources: {}, objectives: {}, progress: 0 }
    const newWeekProgress = {
      ...currentWeekProgress,
      objectives: {
        ...currentWeekProgress.objectives,
        [objectiveKey]: checked,
      },
    }

    // Calculate new progress percentage
    const totalResources = week.resources_needed?.length || 0
    const totalObjectives = week.learning_objectives?.length || 0
    const totalItems = totalResources + totalObjectives

    if (totalItems > 0) {
      const completedResources = Object.values(newWeekProgress.resources).filter(Boolean).length
      const completedObjectives = Object.values(newWeekProgress.objectives).filter(Boolean).length
      const completedItems = completedResources + completedObjectives
      newWeekProgress.progress = Math.min(Math.round((completedItems / totalItems) * 100), 100)
    }

    // Update progress using the progress tracker hook
    await updateWeekProgress(week.week, newWeekProgress)
  }

  const renderWeekCard = (week) => {
    // Get real-time progress
    const currentProgress = calculateWeekProgress(week)
    const isCompleted = week.completed
    const isReady = currentProgress >= 50

    console.log(`Rendering week ${week.week} with progress: ${currentProgress}%`)

    return (
      <Card key={week.week} className={`mb-3 ${isCompleted ? "border-success" : isReady ? "border-warning" : ""}`}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="mb-1">
                Week {week.week}: {week.primary_topic}
              </h6>
              <p className="text-muted small mb-0">{week.focus}</p>
            </div>
            <div className="d-flex flex-column align-items-end gap-2">
              {isCompleted ? (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <CheckCircle size={12} />
                  Completed
                </Badge>
              ) : isReady ? (
                <Badge bg="warning" className="d-flex align-items-center gap-1">
                  <Bullseye size={12} />
                  Ready to Complete
                </Badge>
              ) : (
                <Badge bg="secondary">In Progress</Badge>
              )}
            </div>
          </div>

          {/* Real-time Progress Indicators */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Activity Progress</small>
              <small className="fw-bold text-primary">{currentProgress}%</small>
            </div>
            <ProgressBar
              now={currentProgress}
              variant={currentProgress >= 50 ? "success" : currentProgress > 0 ? "info" : "secondary"}
              style={{ height: "8px" }}
              animated={currentProgress > 0 && currentProgress < 100}
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">
                Resources: {Object.values(progressData[week.week]?.resources || {}).filter(Boolean).length}/
                {week.resources_needed?.length || 0}
              </small>
              <small className="text-muted">
                Objectives: {Object.values(progressData[week.week]?.objectives || {}).filter(Boolean).length}/
                {week.learning_objectives?.length || 0}
              </small>
            </div>
          </div>

          {/* Resource Checklist with real state */}
          {week.resources_needed && week.resources_needed.length > 0 && (
            <div className="mb-3">
              <small className="text-muted d-block mb-2">Resources ({week.resources_needed.length})</small>
              <div className="d-flex flex-wrap gap-1">
                {week.resources_needed.map((resource, idx) => {
                  const resourceKey = resource.id || `resource_${idx}`
                  const isInteracted = progressData[week.week]?.resources?.[resourceKey] || false

                  return (
                    <Badge
                      key={idx}
                      bg={isInteracted ? "success" : "light"}
                      text={isInteracted ? "white" : "dark"}
                      className="small d-flex align-items-center gap-1"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => handleResourceClick(resource, week, idx)}
                    >
                      {isInteracted && <CheckCircle size={10} />}
                      {resource.title}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Learning Objectives with immediate state updates */}
          {week.learning_objectives && (
            <div className="mb-3">
              <small className="text-muted d-block mb-2">Learning Objectives</small>
              <ListGroup variant="flush" className="small">
                {week.learning_objectives.slice(0, 3).map((objective, idx) => {
                  const objectiveKey = `objective_${idx}`
                  const isChecked = Boolean(progressData[week.week]?.objectives?.[objectiveKey])

                  return (
                    <ListGroup.Item key={idx} className="px-0 py-2 border-0">
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          className="me-2"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = Boolean(e.target?.checked)
                            handleObjectiveCheck(week, idx, checked)
                          }}
                          id={`objective-${week.week}-${idx}`}
                        />
                        <label
                          htmlFor={`objective-${week.week}-${idx}`}
                          className={`small mb-0 ${isChecked ? "text-success fw-medium" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault()
                            const newChecked = !isChecked
                            handleObjectiveCheck(week, idx, newChecked)
                          }}
                        >
                          {isChecked && <CheckCircle size={12} className="me-1" />}
                          {objective}
                        </label>
                      </div>
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </div>
          )}

          {/* Action Button */}
          <div className="d-grid">
            {isCompleted ? (
              <Button variant="outline-success" disabled>
                <CheckCircle className="me-1" />
                Completed on {new Date(week.completed_at).toLocaleDateString()}
              </Button>
            ) : (
              <Button
                variant={isReady ? "success" : "outline-primary"}
                onClick={() => handleWeekCompletion(week)}
                disabled={!isReady}
              >
                {isReady ? (
                  <>
                    <BookmarkCheck className="me-1" />
                    Complete Week ({currentProgress}%)
                  </>
                ) : (
                  <>
                    <Clock className="me-1" />
                    Continue Learning ({currentProgress}% done)
                  </>
                )}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    )
  }

  if (!weekData || weekData.length === 0) {
    return (
      <Alert variant="info">
        <h5>Curriculum Not Available</h5>
        <p>The detailed weekly curriculum is being generated. Please check back later.</p>
      </Alert>
    )
  }

  if (progressLoading) {
    return (
      <Alert variant="light">
        <small className="text-muted">Loading progress data...</small>
      </Alert>
    )
  }

  return (
    <div>
      {/* Progress Status */}
      <Alert variant="light" className="mb-3">
        <small className="text-muted">
          <strong>Progress Status:</strong> All interactions are automatically tracked and saved. Session data and
          progress persist across browser sessions.
        </small>
      </Alert>

      {weekData.map(renderWeekCard)}

      {/* Enhanced Completion Modal */}
      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Trophy className="me-2 text-warning" />
            Complete Week {selectedWeek?.week}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWeek && (
            <div>
              <Alert variant="success" className="mb-4">
                <div className="d-flex align-items-center">
                  <CheckCircle className="me-2" />
                  <div>
                    <strong>Great progress!</strong> You've completed most activities for this week.
                    <div className="small text-muted mt-1">
                      Auto-detected: {calculateWeekProgress(selectedWeek)}% resource interaction
                    </div>
                  </div>
                </div>
              </Alert>

              {/* Time Spent */}
              <Form.Group className="mb-3">
                <Form.Label>How many hours did you spend this week? *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={completionData.hoursSpent}
                  onChange={(e) => setCompletionData({ ...completionData, hoursSpent: e.target.value })}
                  placeholder={`Estimated: ${selectedWeek.estimated_hours || 5} hours`}
                />
              </Form.Group>

              {/* Self-Assessment Questions */}
              {selectedWeek.assessment?.self_assessment_questions && (
                <div className="mb-3">
                  <Form.Label>Self-Assessment</Form.Label>
                  {selectedWeek.assessment.self_assessment_questions.slice(0, 2).map((question, idx) => (
                    <div key={idx} className="mb-2">
                      <Form.Label className="small">{question}</Form.Label>
                      <Form.Select
                        value={completionData.selfAssessment[idx] || ""}
                        onChange={(e) =>
                          setCompletionData({
                            ...completionData,
                            selfAssessment: { ...completionData.selfAssessment, [idx]: e.target.value },
                          })
                        }
                      >
                        <option value="">Select your answer</option>
                        <option value="strongly_agree">Strongly Agree</option>
                        <option value="agree">Agree</option>
                        <option value="neutral">Neutral</option>
                        <option value="disagree">Disagree</option>
                        <option value="strongly_disagree">Strongly Disagree</option>
                      </Form.Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Confidence Level */}
              <Form.Group className="mb-3">
                <Form.Label>How confident do you feel about this week's topics? (1-5)</Form.Label>
                <Form.Range
                  min={1}
                  max={5}
                  value={completionData.confidence}
                  onChange={(e) =>
                    setCompletionData({ ...completionData, confidence: Number.parseInt(e.target.value) })
                  }
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>Not confident</span>
                  <span>Very confident</span>
                </div>
              </Form.Group>

              {/* Reflection Notes */}
              <Form.Group className="mb-3">
                <Form.Label>
                  <Lightbulb className="me-1" />
                  Reflection & Notes (optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={completionData.reflectionNotes}
                  onChange={(e) => setCompletionData({ ...completionData, reflectionNotes: e.target.value })}
                  placeholder="What did you learn? What was challenging? Any insights or questions?"
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={submitWeekCompletion} disabled={!completionData.hoursSpent || loading}>
            <Trophy className="me-1" />
            {loading ? "Completing..." : "Complete Week"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ProgressTracker
