"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  Modal,
  Alert,
  Spinner,
  Tab,
  Tabs,
  ListGroup,
  Image,
} from "react-bootstrap"
import {
  BookmarkStar,
  Clock,
  Trophy,
  Calendar,
  Link45deg,
  ArrowLeft,
  Book,
  Youtube,
  Github,
  FileText,
  Mortarboard,
  BookHalf,
  Play,
  Pause,
  Laptop, // Declared Laptop variable here
} from "react-bootstrap-icons"

// Import new components
import ProgressTracker from "./ProgressTracker"
import SmartProgressSuggestions from "./SmartProgressSuggestions"
import { useActivityTracker } from "../../hooks/useActivityTracker"

const LearningPathDetails = () => {
  const { pathId } = useParams()
  const navigate = useNavigate()

  // Existing state
  const [learningPath, setLearningPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  // New activity tracking
  const {
    sessionStart,
    totalSessionTime,
    resourceInteractions,
    startSession,
    endSession,
    trackInteraction,
    isSessionActive,
  } = useActivityTracker(pathId)

  // Modal states
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Activity data for suggestions
  const [activityData, setActivityData] = useState({
    lastActivity: null,
    weekProgress: {},
    totalSessions: 0,
  })

  useEffect(() => {
    if (pathId) {
      fetchLearningPath()
      fetchActivityData()
    }
  }, [pathId])

  // Auto-start session when user arrives
  useEffect(() => {
    if (learningPath && !isSessionActive) {
      startSession()
    }

    // Cleanup on unmount
    return () => {
      if (isSessionActive) {
        endSession()
      }
    }
  }, [learningPath])

  const fetchLearningPath = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      // Updated API endpoint to match your backend
      const response = await fetch(`https://pathcrafter-backend.onrender.com/api/learning-paths/${pathId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const learningPath = await response.json()

      if (response.ok) {
        console.log("Learning path data:", learningPath)
        setLearningPath(learningPath)
      } else {
        setError(learningPath.message || "Failed to fetch learning path")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityData = async () => {
    try {
      const token = localStorage.getItem("token")
      // Updated API endpoint to match your backend
      const response = await fetch(`https://pathcrafter-backend.onrender.com/api/learning-paths/${pathId}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivityData(data.data)
      }
    } catch (err) {
      console.error("Error fetching activity data:", err)
    }
  }

  const handleProgressUpdate = () => {
    fetchLearningPath()
    fetchActivityData()
  }

  const handleSuggestionAction = (actionType, suggestion) => {
    switch (actionType) {
      case "resume":
        if (!isSessionActive) {
          startSession()
        }
        setActiveTab("curriculum")
        break
      case "complete_week":
        setActiveTab("curriculum")
        // Scroll to current week
        break
      case "adjust_schedule":
        // Navigate to settings or show schedule modal
        break
      case "view_resources":
        setActiveTab("resources")
        break
      default:
        break
    }
  }

  const openResourceModal = (resource) => {
    setSelectedResource(resource)
    setShowResourceModal(true)

    // Track resource interaction
    trackInteraction(resource.id || resource.title, "viewed", {
      resourceType: resource.type,
      url: resource.url,
    })
  }

  // Rest of your existing functions remain the same...
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", text: "Active" },
      completed: { variant: "primary", text: "Completed" },
      paused: { variant: "warning", text: "Paused" },
      draft: { variant: "secondary", text: "Draft" },
    }

    const config = statusConfig[status] || { variant: "secondary", text: status }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      beginner: { variant: "success", text: "Beginner" },
      intermediate: { variant: "warning", text: "Intermediate" },
      advanced: { variant: "danger", text: "Advanced" },
    }

    const config = difficultyConfig[difficulty] || { variant: "secondary", text: difficulty }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateProgress = () => {
    if (!learningPath?.progress) return 0
    return learningPath.progress.completion_percentage || 0
  }

  // Get resource icon based on type
  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
      case "youtube":
        return <Youtube className="text-danger" />
      case "github":
      case "project":
        return <Github className="text-dark" />
      case "article":
      case "blog":
        return <FileText className="text-primary" />
      case "course":
        return <Mortarboard className="text-success" />
      case "documentation":
        return <BookHalf className="text-info" />
      case "practice":
        return <Laptop className="text-warning" /> // Laptop variable is now declared
      default:
        return <Book className="text-secondary" />
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading learning path details...</p>
        </div>
      </Container>
    )
  }

  if (error || !learningPath) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error Loading Learning Path</h4>
          <p>{error || "Learning path not found"}</p>
          <Button variant="outline-danger" onClick={() => navigate("/view-paths")}>
            Back to Learning Paths
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Header with Session Status */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button variant="outline-secondary" onClick={() => navigate("/view-paths")} className="me-3">
              <ArrowLeft className="me-1" />
              Back
            </Button>
            <div className="flex-grow-1">
              <h1 className="display-6 mb-2">
                <BookmarkStar className="me-3" />
                {learningPath.title}
              </h1>
              <div className="d-flex align-items-center gap-3">
                {getStatusBadge(learningPath.status)}
                {getDifficultyBadge(learningPath.preferredDifficulty)}
                {learningPath.mlGeneratedContent?.domain && (
                  <Badge bg="info" className="text-capitalize">
                    {learningPath.mlGeneratedContent.domain.replace("-", " ")}
                  </Badge>
                )}
                <span className="text-muted">
                  <Calendar className="me-1" />
                  Created {formatDate(learningPath.createdAt)}
                </span>

                {/* Session Status */}
                {isSessionActive && (
                  <Badge bg="success" className="d-flex align-items-center gap-1">
                    <div className="spinner-grow spinner-grow-sm" role="status" style={{ width: "8px", height: "8px" }}>
                      <span className="visually-hidden">Learning...</span>
                    </div>
                    Learning Session Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Session Controls */}
            <div className="d-flex gap-2">
              {isSessionActive ? (
                <Button variant="outline-warning" onClick={endSession} size="sm">
                  <Pause className="me-1" />
                  End Session
                </Button>
              ) : (
                <Button variant="outline-success" onClick={startSession} size="sm">
                  <Play className="me-1" />
                  Start Learning
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Progress Overview */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h5 className="mb-3">Overall Progress</h5>
                  <ProgressBar
                    now={calculateProgress()}
                    label={`${calculateProgress()}%`}
                    variant={calculateProgress() === 100 ? "success" : "primary"}
                    style={{ height: "20px" }}
                    className="mb-3"
                  />
                  <div className="d-flex justify-content-between text-muted">
                    <span>
                      Week {learningPath.progress?.current_week || 1} of {learningPath.durationWeeks}
                    </span>
                    <span>{learningPath.progress?.total_hours_logged || 0} hours logged</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="border rounded p-3">
                          <Clock className="text-muted mb-2" />
                          <div>
                            <strong>{learningPath.durationWeeks}</strong>
                            <div className="small text-muted">weeks</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3">
                          <Trophy className="text-muted mb-2" />
                          <div>
                            <strong>{Math.round(totalSessionTime)}</strong>
                            <div className="small text-muted">min today</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Smart Suggestions */}
      <SmartProgressSuggestions
        pathId={pathId}
        currentWeek={learningPath.progress?.current_week || 1}
        activityData={activityData}
        onSuggestionAction={handleSuggestionAction}
      />

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          {/* Your existing overview content */}
          <Row>
            <Col md={8}>
              {/* Description */}
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">
                    <Book className="me-2" />
                    Description
                  </h5>
                  <p>{learningPath.description || "No description provided."}</p>

                  {learningPath.goals && learningPath.goals.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-2">Learning Goals:</h6>
                      <ul>
                        {learningPath.goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Rest of your existing overview content... */}
            </Col>
            <Col md={4}>{/* Your existing sidebar content... */}</Col>
          </Row>
        </Tab>

        <Tab eventKey="curriculum" title="Weekly Curriculum">
          {/* Replace your existing curriculum content with the new ProgressTracker */}
          {learningPath.mlGeneratedContent?.weekly_plan ? (
            <ProgressTracker
              pathId={pathId}
              weekData={learningPath.mlGeneratedContent.weekly_plan}
              onProgressUpdate={handleProgressUpdate}
            />
          ) : (
            <Alert variant="info">
              <h5>Curriculum Not Available</h5>
              <p>The detailed weekly curriculum is being generated. Please check back later.</p>
            </Alert>
          )}
        </Tab>

        <Tab eventKey="resources" title="Resources">
          {/* Your existing resources content with enhanced tracking */}
          {learningPath.mlGeneratedContent?.resources ? (
            <Row>
              {/* Your existing resource rendering code, but add onClick tracking */}
              {/* Example for videos: */}
              <Col md={6} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <Youtube className="me-2 text-danger" />
                      Videos
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <ListGroup variant="flush">
                      {learningPath.mlGeneratedContent.resources.videos &&
                      learningPath.mlGeneratedContent.resources.videos.length > 0 ? (
                        learningPath.mlGeneratedContent.resources.videos.map((video, index) => (
                          <ListGroup.Item key={index} action onClick={() => openResourceModal(video)}>
                            {/* Your existing video item content */}
                            <div className="d-flex align-items-start">
                              <div className="flex-shrink-0">
                                {video.thumbnail ? (
                                  <Image
                                    src={video.thumbnail || "/placeholder.svg"}
                                    alt={video.title}
                                    width={80}
                                    height={45}
                                    className="rounded"
                                  />
                                ) : (
                                  <div
                                    className="bg-light d-flex align-items-center justify-content-center rounded"
                                    style={{ width: "80px", height: "45px" }}
                                  >
                                    <Youtube size={24} className="text-danger" />
                                  </div>
                                )}
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-1">{video.title}</h6>
                                <p className="small text-muted mb-1">
                                  {video.description
                                    ? video.description.length > 80
                                      ? `${video.description.substring(0, 80)}...`
                                      : video.description
                                    : "No description available"}
                                </p>
                                <div className="d-flex align-items-center gap-2">
                                  {video.duration && (
                                    <small className="text-muted">
                                      <Clock size={10} className="me-1" />
                                      {video.duration}
                                    </small>
                                  )}
                                  {video.difficulty && (
                                    <Badge
                                      bg={
                                        video.difficulty === "beginner"
                                          ? "success"
                                          : video.difficulty === "intermediate"
                                            ? "warning"
                                            : "danger"
                                      }
                                      className="small"
                                    >
                                      {video.difficulty}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item className="text-center py-4 text-muted">
                          No video resources available
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              {/* Repeat similar pattern for other resource types... */}
            </Row>
          ) : (
            <Alert variant="info">
              <h5>Resources Not Available</h5>
              <p>Learning resources are being curated for your path. Please check back later.</p>
            </Alert>
          )}
        </Tab>
      </Tabs>

      {/* Enhanced Resource Detail Modal */}
      <Modal show={showResourceModal} onHide={() => setShowResourceModal(false)} size="lg" centered>
        {selectedResource && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center">
                {getResourceIcon(selectedResource.type)}
                <span className="ms-2">{selectedResource.title}</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Your existing modal content */}
              {selectedResource.type === "video" &&
                selectedResource.url &&
                selectedResource.url.includes("youtube") && (
                  <div className="ratio ratio-16x9 mb-3">
                    <iframe
                      src={selectedResource.url.replace("watch?v=", "embed/")}
                      title={selectedResource.title}
                      allowFullScreen
                      onLoad={() =>
                        trackInteraction(selectedResource.id || selectedResource.title, "viewed", {
                          resourceType: "video_embed",
                          url: selectedResource.url,
                        })
                      }
                    ></iframe>
                  </div>
                )}

              <h5>Description</h5>
              <p>{selectedResource.description || "No description available."}</p>

              {/* Rest of your existing modal content... */}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowResourceModal(false)}>
                Close
              </Button>
              {selectedResource.url && (
                <Button
                  variant="primary"
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackInteraction(selectedResource.id || selectedResource.title, "completed", {
                      resourceType: selectedResource.type,
                      url: selectedResource.url,
                    })
                  }
                >
                  <Link45deg className="me-1" />
                  Open Resource
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  )
}

export default LearningPathDetails
