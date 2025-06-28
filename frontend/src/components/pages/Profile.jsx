"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Alert, Spinner, Modal, Form } from "react-bootstrap"
import {
  PersonCircle,
  Trophy,
  BookmarkStar,
  Clock,
  Award,
  Calendar,
  Pin ,
  Globe,
  Envelope,
  PencilSquare,
  CheckCircle,
  Star,
  GraphUp,
  Activity,
  Bullseye,
} from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import { useUser } from "../common/UserContext"

const Profile = () => {
  const { user, loading, error, logout, refreshProfile, updateUser } = useUser()
  const navigate = useNavigate()

  // Local states
  const [refreshing, setRefreshing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState("")

  // User statistics state
  const [userStats, setUserStats] = useState({
    pathsCreated: 0,
    pathsCompleted: 0,
    activePaths: 0,
    totalHoursLogged: 0,
    currentStreak: 0,
    achievements: [],
  })
  const [recentPaths, setRecentPaths] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  const setUserPaths = (paths) => {
    // Assuming this function is needed to update user paths in context or elsewhere
    console.log("User paths set:", paths)
  }

  useEffect(() => {
    if (!user && !loading) {
      handleRefreshProfile()
    }
    if (user) {
      setEditData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      })
      fetchUserStats()
      fetchRecentPaths()
    }
  }, [user, loading])

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch user's learning paths using the correct endpoint
      const response = await fetch("http://localhost:5000/api/ml/paths", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const paths = data.data || []
        setUserPaths(paths)

        // Calculate statistics from real data
        const completedPaths = paths.filter((path) => path.progress?.completion_percentage === 100)
        const activePaths = paths.filter(
          (path) => path.progress?.completion_percentage > 0 && path.progress?.completion_percentage < 100,
        )
        const totalHours = paths.reduce((sum, path) => sum + (path.progress?.total_hours_logged || 0), 0)

        setUserStats({
          pathsCreated: paths.length,
          pathsCompleted: completedPaths.length,
          activePaths: activePaths.length,
          totalHoursLogged: Math.round(totalHours),
          currentStreak: Math.floor(Math.random() * 15) + 1, // Mock streak
          achievements: generateAchievements(paths.length, completedPaths.length, Math.round(totalHours)),
        })
      }
    } catch (err) {
      console.error("Error fetching user stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchRecentPaths = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/ml/paths", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const paths = data.data || []
        // Get the 3 most recent paths
        const recent = paths.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
        setRecentPaths(recent)
      }
    } catch (err) {
      console.error("Error loading recent paths:", err)
    }
  }

  const generateAchievements = (pathsCreated, pathsCompleted, hoursLogged) => {
    const achievements = []

    if (pathsCreated >= 1) {
      achievements.push({
        id: "first-path",
        title: "Path Pioneer",
        description: "Created your first learning path",
        icon: "🎯",
        earned: true,
        earnedDate: new Date().toISOString(),
      })
    }

    if (pathsCompleted >= 1) {
      achievements.push({
        id: "first-completion",
        title: "Goal Achiever",
        description: "Completed your first learning path",
        icon: "🏆",
        earned: true,
        earnedDate: new Date().toISOString(),
      })
    }

    if (hoursLogged >= 10) {
      achievements.push({
        id: "dedicated-learner",
        title: "Dedicated Learner",
        description: "Logged 10+ hours of learning",
        icon: "📚",
        earned: true,
        earnedDate: new Date().toISOString(),
      })
    }

    if (pathsCreated >= 5) {
      achievements.push({
        id: "path-creator",
        title: "Path Creator",
        description: "Created 5 learning paths",
        icon: "🛤️",
        earned: true,
        earnedDate: new Date().toISOString(),
      })
    }

    if (hoursLogged >= 50) {
      achievements.push({
        id: "learning-master",
        title: "Learning Master",
        description: "Logged 50+ hours of learning",
        icon: "🎓",
        earned: true,
        earnedDate: new Date().toISOString(),
      })
    }

    // Add some unearned achievements
    if (pathsCompleted < 5) {
      achievements.push({
        id: "completion-champion",
        title: "Completion Champion",
        description: "Complete 5 learning paths",
        icon: "🏅",
        earned: false,
        requirement: "5 completed paths",
      })
    }

    if (hoursLogged < 100) {
      achievements.push({
        id: "century-learner",
        title: "Century Learner",
        description: "Log 100 hours of learning",
        icon: "💯",
        earned: false,
        requirement: "100 hours logged",
      })
    }

    return achievements
  }

  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true)
      await refreshProfile()
    } catch (err) {
      console.error("Error refreshing profile:", err)
      navigate("/login")
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError("")
    setEditSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (response.ok) {
        updateUser(editData)
        setShowEditModal(false)
        setEditSuccess("Changes saved!")
      } else {
        setEditError(data.message || "Failed to save changes. Please try again.")
      }
    } catch (err) {
      setEditError("Error updating profile")
      console.error("Error:", err)
    } finally {
      setEditLoading(false)
    }
  }

  const calculateUserLevel = (hoursLogged) => {
    // Simple level calculation: 1 level per 10 hours
    return Math.floor(hoursLogged / 10) + 1
  }

  const getProgressToNextLevel = (hoursLogged) => {
    const currentLevelHours = Math.floor(hoursLogged / 10) * 10
    const nextLevelHours = currentLevelHours + 10
    const progress = ((hoursLogged - currentLevelHours) / 10) * 100
    return { progress, nextLevelHours }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const userLevel = calculateUserLevel(userStats.totalHoursLogged)
  const { progress: levelProgress, nextLevelHours } = getProgressToNextLevel(userStats.totalHoursLogged)

  if (loading || refreshing) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading your profile...</p>
      </Container>
    )
  }

  if (error || !user) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Profile Error</Alert.Heading>
          <p>{error || "Unable to load profile. Please log in again."}</p>
          <hr />
          <div className="d-flex justify-content-end gap-2">
            <Button onClick={handleRefreshProfile} variant="outline-primary">
              Try Again
            </Button>
            <Button onClick={() => navigate("/login")} variant="outline-danger">
              Go to Login
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Profile Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={2} className="text-center">
                  <div className="position-relative d-inline-block">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt="Profile"
                        className="rounded-circle border border-3 border-primary"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle border border-3 border-primary d-flex align-items-center justify-content-center bg-light"
                        style={{ width: "120px", height: "120px", fontSize: "2rem" }}
                      >
                        <PersonCircle size={60} className="text-muted" />
                      </div>
                    )}
                    <Badge
                      bg="primary"
                      className="position-absolute bottom-0 end-0 rounded-pill px-2 py-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Level {userLevel}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <h2 className="mb-2">{user.name || user.username || "User"}</h2>
                  <p className="text-muted mb-3">
                    {editData.bio || "Learning enthusiast on a journey of continuous growth"}
                  </p>

                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {user.email && (
                      <div className="d-flex align-items-center text-muted">
                        <Envelope size={16} className="me-2" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {editData.location && (
                      <div className="d-flex align-items-center text-muted">
                        <Pin  size={16} className="me-2" />
                        <span>{editData.location}</span>
                      </div>
                    )}
                    {editData.website && (
                      <div className="d-flex align-items-center text-muted">
                        <Globe size={16} className="me-2" />
                        <a href={editData.website} target="_blank" rel="noopener noreferrer">
                          {editData.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Level Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Progress to Level {userLevel + 1}</small>
                      <small className="text-muted">
                        {userStats.totalHoursLogged} / {nextLevelHours} hours
                      </small>
                    </div>
                    <ProgressBar now={levelProgress} variant="primary" style={{ height: "8px" }} />
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button variant="outline-primary" onClick={() => setShowEditModal(true)} className="mb-3">
                    <PencilSquare className="me-2" />
                    Edit Profile
                  </Button>

                  {/* Quick Stats */}
                  <Row className="g-2 text-center">
                    <Col>
                      <div className="border rounded p-2">
                        <div className="fw-bold text-primary">{userStats.pathsCreated}</div>
                        <small className="text-muted">Paths Created</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="border rounded p-2">
                        <div className="fw-bold text-success">{userStats.pathsCompleted}</div>
                        <small className="text-muted">Completed</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="border rounded p-2">
                        <div className="fw-bold text-info">{userStats.currentStreak}</div>
                        <small className="text-muted">Day Streak</small>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Statistics */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <GraphUp className="me-2" />
                Learning Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col md={3} className="text-center">
                  <div className="mb-2">
                    <BookmarkStar size={32} className="text-primary" />
                  </div>
                  <h4 className="mb-1">{userStats.pathsCreated}</h4>
                  <p className="text-muted mb-0">Paths Created</p>
                </Col>
                <Col md={3} className="text-center">
                  <div className="mb-2">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h4 className="mb-1">{userStats.pathsCompleted}</h4>
                  <p className="text-muted mb-0">Completed</p>
                </Col>
                <Col md={3} className="text-center">
                  <div className="mb-2">
                    <Activity size={32} className="text-warning" />
                  </div>
                  <h4 className="mb-1">{userStats.activePaths}</h4>
                  <p className="text-muted mb-0">Active Paths</p>
                </Col>
                <Col md={3} className="text-center">
                  <div className="mb-2">
                    <Clock size={32} className="text-info" />
                  </div>
                  <h4 className="mb-1">{userStats.totalHoursLogged}</h4>
                  <p className="text-muted mb-0">Hours Logged</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Recent Learning Paths */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Bullseye className="me-2" />
                Recent Learning Paths
              </h5>
            </Card.Header>
            <Card.Body>
              {recentPaths.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {recentPaths.map((path) => (
                    <div key={path._id} className="d-flex align-items-center p-3 border rounded">
                      <div className="me-3">
                        <BookmarkStar size={24} className="text-primary" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{path.title}</h6>
                        <p className="text-muted small mb-2">{path.description?.substring(0, 80)}...</p>
                        <div className="d-flex align-items-center gap-3">
                          <Badge
                            bg={
                              path.status === "completed"
                                ? "success"
                                : path.status === "active"
                                  ? "primary"
                                  : "secondary"
                            }
                          >
                            {path.status}
                          </Badge>
                          <small className="text-muted">
                            <Calendar size={12} className="me-1" />
                            {formatDate(path.createdAt)}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="mb-2">
                          <small className="text-muted">Progress</small>
                        </div>
                        <ProgressBar
                          now={path.progress?.completion_percentage || 0}
                          style={{ width: "100px", height: "6px" }}
                          variant={path.progress?.completion_percentage === 100 ? "success" : "primary"}
                        />
                        <small className="text-muted">{path.progress?.completion_percentage || 0}%</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookmarkStar size={48} className="text-muted mb-3" />
                  <h6>No Learning Paths Yet</h6>
                  <p className="text-muted">Create your first learning path to get started!</p>
                  <Button variant="primary" onClick={() => navigate("/create-path")}>
                    Create Learning Path
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Achievements */}
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Award className="me-2" />
                Achievements
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-3">
                {userStats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`d-flex align-items-center p-3 border rounded ${
                      achievement.earned ? "bg-light border-success" : "bg-light border-secondary opacity-75"
                    }`}
                  >
                    <div className="me-3">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          achievement.earned ? "bg-success text-white" : "bg-secondary text-white"
                        }`}
                        style={{ width: "40px", height: "40px", fontSize: "1.2rem" }}
                      >
                        {achievement.earned ? <Trophy size={20} /> : <Star size={20} />}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className={`mb-1 ${achievement.earned ? "text-success" : "text-muted"}`}>
                        {achievement.title}
                      </h6>
                      <p className="small text-muted mb-0">{achievement.description}</p>
                      {achievement.earned && achievement.earnedDate && (
                        <small className="text-success">Earned {formatDate(achievement.earnedDate)}</small>
                      )}
                      {!achievement.earned && achievement.requirement && (
                        <small className="text-muted">Requirement: {achievement.requirement}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                placeholder="City, Country"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                value={editData.website}
                onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default Profile
