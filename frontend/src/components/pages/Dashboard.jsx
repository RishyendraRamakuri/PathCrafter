"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../common/UserContext"
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  ProgressBar,
  ListGroup,
  Modal,
} from "react-bootstrap"
import {
  BookmarkStar,
  Clock,
  Trophy,
  Bullseye,
  Play,
  CheckCircle,
  Calendar,
  GraphUp,
  Book,
  Lightning,
  Fire,
  Star,
  ArrowRight,
  Plus,
  Activity,
  BarChart,
} from "react-bootstrap-icons"
import "./Dashboard.css"

function Dashboard() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  // State management
  const [dashboardData, setDashboardData] = useState({
    activePaths: [],
    recentActivity: [],
    stats: {
      totalPaths: 0,
      activePaths: 0,
      completedPaths: 0,
      totalHoursSpent: 0,
      currentStreak: 0,
      weeklyProgress: 0,
    },
    recommendations: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in to view your dashboard")
        setLoading(false)
        return
      }

      // Updated to use the correct API endpoint
      const response = await fetch("https://pathcrafter-backend.onrender.com/api/learning-paths", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const allPaths = await response.json()

      if (response.ok) {
        // Process data for dashboard using existing data
        const activePaths = allPaths.filter((path) => path.status === "active")
        const completedPaths = allPaths.filter((path) => path.status === "completed")

        // Calculate stats from existing data
        const totalHoursSpent = allPaths.reduce((total, path) => {
          return total + (path.progress?.total_hours_logged || 0)
        }, 0)

        // Generate recent activity from existing path data
        const recentActivity = generateRecentActivityFromPaths(allPaths)

        // Generate recommendations
        const recommendations = generateRecommendations(activePaths)

        setDashboardData({
          activePaths: activePaths.slice(0, 4), // Show top 4 active paths
          recentActivity: recentActivity.slice(0, 5),
          stats: {
            totalPaths: allPaths.length,
            activePaths: activePaths.length,
            completedPaths: completedPaths.length,
            totalHoursSpent: Math.round(totalHoursSpent),
            currentStreak: calculateStreakFromPaths(allPaths), // Calculate from existing data
            weeklyProgress: calculateWeeklyProgress(activePaths),
          },
          recommendations,
        })
      } else {
        setError(allPaths.message || "Failed to fetch dashboard data")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Generate recent activity from existing path data
  const generateRecentActivityFromPaths = (paths) => {
    const activities = []

    paths.forEach((path) => {
      // Add path creation activity
      activities.push({
        type: "path_created",
        message: `Created learning path: ${path.title}`,
        date: path.createdAt,
        pathId: path._id,
      })

      // Add completion activity for completed paths
      if (path.status === "completed") {
        activities.push({
          type: "path_completed",
          message: `Completed learning path: ${path.title}`,
          date: path.updatedAt,
          pathId: path._id,
        })
      }

      // Add progress activity if there's progress data
      if (path.progress && path.progress.completion_percentage > 0) {
        activities.push({
          type: "progress_update",
          message: `Made progress on ${path.title} (${path.progress.completion_percentage}% complete)`,
          date: path.progress.last_activity || path.updatedAt,
          pathId: path._id,
        })
      }
    })

    // Sort by date (newest first) and return recent ones
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
  }

  // Calculate streak from existing path data
  const calculateStreakFromPaths = (paths) => {
    // Simple streak calculation based on recent activity
    const recentPaths = paths.filter((path) => {
      const daysSinceCreated = (new Date() - new Date(path.createdAt)) / (1000 * 60 * 60 * 24)
      return daysSinceCreated <= 30 // Paths created in last 30 days
    })

    const activePaths = paths.filter((path) => path.status === "active")

    // Basic streak calculation: number of active paths + recent activity
    return Math.min(recentPaths.length + activePaths.length, 30)
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

    // Add general recommendations
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

  const calculateWeeklyProgress = (activePaths) => {
    if (activePaths.length === 0) return 0
    const totalProgress = activePaths.reduce((sum, path) => sum + (path.progress?.completion_percentage || 0), 0)
    return Math.round(totalProgress / activePaths.length)
  }

  const handleContinueLearning = (path) => {
    navigate(`/learning-path/${path._id}`)
  }

  const handleMarkProgress = (path) => {
    setSelectedPath(path)
    setShowProgressModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "path_completed":
        return <CheckCircle className="text-success" />
      case "progress_update":
        return <GraphUp className="text-primary" />
      case "path_created":
        return <Plus className="text-info" />
      default:
        return <Activity className="text-info" />
    }
  }

  const getPriorityBadge = (priority) => {
    const config = {
      high: { variant: "danger", text: "High Priority" },
      medium: { variant: "warning", text: "Medium Priority" },
      low: { variant: "secondary", text: "Low Priority" },
    }
    const { variant, text } = config[priority] || config.low
    return (
      <Badge bg={variant} className="small">
        {text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status" size="lg">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3 text-muted">Loading your learning dashboard...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Container fluid>
        {/* Welcome Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 mb-2">
                  Welcome back, {user?.name || user?.username || "Learner"}!
                  <Fire className="ms-2 text-warning" />
                </h1>
                <p className="text-muted mb-0">
                  Ready to continue your learning journey? Here's your progress overview.
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" onClick={() => navigate("/viewpaths")}>
                  <Book className="me-2" />
                  View All Paths
                </Button>
                <Button variant="primary" onClick={() => navigate("/create-path")}>
                  <Plus className="me-2" />
                  Create New Path
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Stats Overview */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 text-primary mb-2">
                  <Bullseye />
                </div>
                <h3 className="mb-1">{dashboardData.stats.activePaths}</h3>
                <small className="text-muted">Active Paths</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 text-success mb-2">
                  <CheckCircle />
                </div>
                <h3 className="mb-1">{dashboardData.stats.completedPaths}</h3>
                <small className="text-muted">Completed</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 text-info mb-2">
                  <Clock />
                </div>
                <h3 className="mb-1">{dashboardData.stats.totalHoursSpent}</h3>
                <small className="text-muted">Hours Learned</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="display-4 text-warning mb-2">
                  <Lightning />
                </div>
                <h3 className="mb-1">{dashboardData.stats.currentStreak}</h3>
                <small className="text-muted">Activity Score</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <BarChart className="text-primary me-2" />
                  <h6 className="mb-0">Weekly Progress</h6>
                </div>

                {/* Enhanced Weekly Progress Display */}
                {dashboardData.activePaths.length > 0 ? (
                  <div>
                    {dashboardData.activePaths.slice(0, 2).map((path, index) => (
                      <div key={path._id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-medium text-truncate me-2" style={{ maxWidth: "150px" }}>
                            {path.title}
                          </small>
                          <small className="fw-bold text-primary">{path.progress?.completion_percentage || 0}%</small>
                        </div>
                        <ProgressBar
                          now={path.progress?.completion_percentage || 0}
                          variant={
                            (path.progress?.completion_percentage || 0) >= 80
                              ? "success"
                              : (path.progress?.completion_percentage || 0) >= 50
                                ? "warning"
                                : "primary"
                          }
                          style={{ height: "8px" }}
                          className="mb-1"
                        />
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.75rem" }}>
                          <span>
                            Week {path.progress?.current_week || 1} of {path.durationWeeks}
                          </span>
                          <span>{path.progress?.total_hours_logged || 0}h logged</span>
                        </div>
                      </div>
                    ))}

                    {dashboardData.activePaths.length > 2 && (
                      <div className="text-center mb-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate("/view-paths")}
                          className="w-100"
                        >
                          View All {dashboardData.activePaths.length} Active Paths
                        </Button>
                      </div>
                    )}

                    {/* Overall Progress Summary */}
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Overall Progress</small>
                        <small className="fw-bold">{dashboardData.stats.weeklyProgress}%</small>
                      </div>
                      <ProgressBar now={dashboardData.stats.weeklyProgress} variant="info" style={{ height: "6px" }} />
                      <small className="text-muted">Average across all active paths</small>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <BarChart size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-2">No active paths to track</p>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate("/create-path")}>
                      Create Your First Path
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Active Learning Paths */}
          <Col lg={8}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <Play className="me-2 text-primary" />
                    Continue Learning
                  </h5>
                  {dashboardData.activePaths.length > 0 && (
                    <Button variant="outline-primary" size="sm" onClick={() => navigate("/view-paths")}>
                      View All Active
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                {dashboardData.activePaths.length === 0 ? (
                  <div className="text-center py-4">
                    <BookmarkStar size={48} className="text-muted mb-3" />
                    <h6>No Active Learning Paths</h6>
                    <p className="text-muted mb-3">Start your learning journey by creating a new path!</p>
                    <Button variant="primary" onClick={() => navigate("/create-path")}>
                      <Plus className="me-2" />
                      Create Your First Path
                    </Button>
                  </div>
                ) : (
                  <Row>
                    {dashboardData.activePaths.map((path) => (
                      <Col md={6} key={path._id} className="mb-3">
                        <Card className="border h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">{path.title}</h6>
                              <Badge bg="success" className="small">
                                Active
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Progress</small>
                                <small className="fw-bold">{path.progress?.completion_percentage || 0}%</small>
                              </div>
                              <ProgressBar
                                now={path.progress?.completion_percentage || 0}
                                variant="success"
                                style={{ height: "6px" }}
                              />
                            </div>

                            <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
                              <span>
                                <Clock size={12} className="me-1" />
                                {path.estimatedCompletionTime} hours
                              </span>
                              <span>
                                <Trophy size={12} className="me-1" />
                                {path.difficulty}
                              </span>
                            </div>

                            <div className="d-grid gap-2">
                              <Button variant="primary" size="sm" onClick={() => handleContinueLearning(path)}>
                                <Play size={14} className="me-1" />
                                Continue Learning
                              </Button>
                              <Button variant="outline-secondary" size="sm" onClick={() => handleMarkProgress(path)}>
                                <CheckCircle size={14} className="me-1" />
                                View Details
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>

            {/* Smart Recommendations */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <h5 className="mb-0">
                  <Bullseye className="me-2 text-warning" />
                  Smart Recommendations
                </h5>
              </Card.Header>
              <Card.Body>
                {dashboardData.recommendations.length === 0 ? (
                  <div className="text-center py-3">
                    <Star size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No recommendations available right now.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {dashboardData.recommendations.map((rec, index) => (
                      <div key={index} className="d-flex align-items-center p-3 border rounded">
                        <div className="me-3">
                          {rec.type === "continue" && <Play className="text-primary" size={24} />}
                          {rec.type === "finish" && <Bullseye className="text-success" size={24} />}
                          {rec.type === "start" && <Plus className="text-info" size={24} />}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mb-0">{rec.title}</h6>
                            {getPriorityBadge(rec.priority)}
                          </div>
                          <p className="text-muted small mb-0">{rec.description}</p>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            if (rec.pathId) {
                              navigate(`/learning-path/${rec.pathId}`)
                            } else if (rec.type === "start") {
                              navigate("/create-path")
                            }
                          }}
                        >
                          {rec.action}
                          <ArrowRight className="ms-1" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Activity Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <h5 className="mb-0">
                  <Activity className="me-2 text-info" />
                  Recent Activity
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {dashboardData.recentActivity.length === 0 ? (
                  <div className="text-center py-4 px-3">
                    <Calendar size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No recent activity to show.</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <ListGroup.Item key={index} className="border-0">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">{getActivityIcon(activity.type)}</div>
                          <div className="flex-grow-1">
                            <p className="mb-1 small">{activity.message}</p>
                            <small className="text-muted">
                              <Calendar size={12} className="me-1" />
                              {formatDate(activity.date)}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <h5 className="mb-0">
                  <Lightning className="me-2 text-warning" />
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => navigate("/create-path")}>
                    <Plus className="me-2" />
                    Create New Path
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate("/view-paths")}>
                    <Book className="me-2" />
                    Browse All Paths
                  </Button>
                  <Button variant="outline-secondary" onClick={fetchDashboardData}>
                    <Activity className="me-2" />
                    Refresh Dashboard
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progress Update Modal */}
        <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Path Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPath && (
              <div>
                <h6>{selectedPath.title}</h6>
                <p className="text-muted">View detailed information about this learning path.</p>

                <div className="mb-3">
                  <label className="form-label">Current Progress</label>
                  <ProgressBar
                    now={selectedPath.progress?.completion_percentage || 0}
                    label={`${selectedPath.progress?.completion_percentage || 0}%`}
                  />
                </div>

                <div className="alert alert-info">
                  <small>
                    <strong>Tip:</strong> Click "Go to Full Details" to access the complete learning path with resources
                    and curriculum.
                  </small>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProgressModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowProgressModal(false)
                if (selectedPath) {
                  navigate(`/learning-path/${selectedPath._id}`)
                }
              }}
            >
              Go to Full Details
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  )
}

export default Dashboard
