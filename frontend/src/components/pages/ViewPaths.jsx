"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Modal,
  ProgressBar,
  ListGroup,
  Tabs,
  Tab,
} from "react-bootstrap"
import {
  BookmarkStar,
  Clock,
  Trophy,
  Search,
  Filter,
  Eye,
  Trash,
  Play,
  Pause,
  CheckCircle,
  Calendar,
  Bullseye,
  Book,
  Award,
  ArrowClockwise,
  Youtube,
  Github,
  FileText,
  Mortarboard,
  BookHalf,
  Laptop,
  StarFill,
  Grid3x3Gap,
  List,
} from "react-bootstrap-icons"

const ViewPaths = () => {
  const navigate = useNavigate()

  // State management
  const [learningPaths, setLearningPaths] = useState([])
  const [filteredPaths, setFilteredPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [domainFilter, setDomainFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // View state
  const [viewMode, setViewMode] = useState("grid") // grid or list

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pathToDelete, setPathToDelete] = useState(null)
  const [activeModalTab, setActiveModalTab] = useState("overview")

  // Fetch learning paths on component mount
  useEffect(() => {
    fetchLearningPaths()
  }, [])

  // Apply filters whenever search/filter criteria change
  useEffect(() => {
    applyFilters()
  }, [learningPaths, searchTerm, statusFilter, difficultyFilter, domainFilter, sortBy])

  const fetchLearningPaths = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please log in to view your learning paths")
        setLoading(false)
        setRefreshing(false)
        return
      }

      const response = await fetch("https://pathcrafter-backend.onrender.com/api/ml/paths", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Fetched paths:", data.data)
        setLearningPaths(data.data || [])
      } else {
        setError(data.message || "Failed to fetch learning paths")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error fetching paths:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...learningPaths]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (path) =>
          path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.goals?.some((goal) => goal.toLowerCase().includes(searchTerm.toLowerCase())) ||
          path.mlGeneratedContent?.domain?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((path) => path.status === statusFilter)
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((path) => path.preferredDifficulty === difficultyFilter)
    }

    // Domain filter
    if (domainFilter !== "all") {
      filtered = filtered.filter((path) => path.mlGeneratedContent?.domain === domainFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "title":
          return a.title.localeCompare(b.title)
        case "progress":
          return (b.progress?.completion_percentage || 0) - (a.progress?.completion_percentage || 0)
        case "duration":
          return b.durationWeeks - a.durationWeeks
        default:
          return 0
      }
    })

    setFilteredPaths(filtered)
  }

  const handleViewDetails = (path) => {
    setSelectedPath(path)
    setActiveModalTab("overview")
    setShowDetailModal(true)
  }

  const handleDeletePath = async (pathId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`https://pathcrafter-backend.onrender.com/api/ml/paths/${pathId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setLearningPaths((prev) => prev.filter((path) => path._id !== pathId))
        setShowDeleteModal(false)
        setPathToDelete(null)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete learning path")
      }
    } catch (err) {
      setError("Error deleting learning path")
      console.error("Error:", err)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", text: "Active", icon: Play },
      completed: { variant: "primary", text: "Completed", icon: CheckCircle },
      paused: { variant: "warning", text: "Paused", icon: Pause },
      draft: { variant: "secondary", text: "Draft", icon: Book },
      generating: { variant: "info", text: "Generating...", icon: Spinner },
    }

    const config = statusConfig[status] || { variant: "secondary", text: status, icon: Book }
    const IconComponent = config.icon

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <IconComponent size={12} />
        {config.text}
      </Badge>
    )
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

  const getDomainBadge = (domain) => {
    if (!domain) return null

    const domainConfig = {
      "web-development": { variant: "primary", text: "Web Development" },
      "data-science": { variant: "success", text: "Data Science" },
      "mobile-development": { variant: "danger", text: "Mobile Development" },
      "cloud-computing": { variant: "info", text: "Cloud Computing" },
      cybersecurity: { variant: "dark", text: "Cybersecurity" },
      "ui-ux-design": { variant: "secondary", text: "UI/UX Design" },
      "game-development": { variant: "warning", text: "Game Development" },
      blockchain: { variant: "light", text: "Blockchain", textColor: "dark" },
    }

    const config = domainConfig[domain] || { variant: "secondary", text: domain.replace("-", " ") }
    return (
      <Badge bg={config.variant} text={config.textColor}>
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateProgress = (path) => {
    if (!path.progress) return 0
    return path.progress.completion_percentage || 0
  }

  // Get unique domains from learning paths
  const getUniqueDomains = () => {
    const domains = learningPaths.map((path) => path.mlGeneratedContent?.domain).filter((domain) => domain)
    return ["all", ...new Set(domains)]
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
        return <Laptop className="text-warning" />
      default:
        return <Book className="text-secondary" />
    }
  }

  // Count resources in a path
  const countResources = (path) => {
    if (!path.mlGeneratedContent?.resources) return 0

    const resources = path.mlGeneratedContent.resources
    let count = 0

    // Count all resources in all categories
    Object.values(resources).forEach((resourceArray) => {
      if (Array.isArray(resourceArray)) {
        count += resourceArray.length
      }
    })

    return count
  }

  // Render resource preview
  const renderResourcePreview = (resources) => {
    if (!resources) return null

    const resourceTypes = []

    if (resources.videos?.length > 0) {
      resourceTypes.push({ type: "videos", count: resources.videos.length, icon: Youtube, color: "text-danger" })
    }
    if (resources.projects?.length > 0) {
      resourceTypes.push({ type: "projects", count: resources.projects.length, icon: Github, color: "text-dark" })
    }
    if (resources.articles?.length > 0) {
      resourceTypes.push({ type: "articles", count: resources.articles.length, icon: FileText, color: "text-primary" })
    }
    if (resources.courses?.length > 0) {
      resourceTypes.push({ type: "courses", count: resources.courses.length, icon: Mortarboard, color: "text-success" })
    }

    return (
      <div className="d-flex gap-2 flex-wrap">
        {resourceTypes.slice(0, 4).map(({ type, count, icon: Icon, color }) => (
          <div key={type} className="d-flex align-items-center gap-1 small">
            <Icon size={14} className={color} />
            <span>{count}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your learning paths...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 mb-2">
                <BookmarkStar className="me-3" />
                Your Learning Paths
              </h1>
              <p className="text-muted">Manage and track your personalized learning journeys</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={fetchLearningPaths}
                disabled={refreshing}
                className="d-flex align-items-center"
              >
                {refreshing ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <ArrowClockwise className="me-2" />
                )}
                Refresh
              </Button>
              <Button variant="primary" onClick={() => navigate("/create-path")} size="lg">
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

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="g-3 align-items-end">
                {/* Search */}
                <Col md={3}>
                  <Form.Label className="small text-muted">Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search paths..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>

                {/* Status Filter */}
                <Col md={2}>
                  <Form.Label className="small text-muted">Status</Form.Label>
                  <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </Form.Select>
                </Col>

                {/* Difficulty Filter */}
                <Col md={2}>
                  <Form.Label className="small text-muted">Difficulty</Form.Label>
                  <Form.Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Form.Select>
                </Col>

                {/* Domain Filter */}
                <Col md={2}>
                  <Form.Label className="small text-muted">Domain</Form.Label>
                  <Form.Select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                    {getUniqueDomains().map((domain) => (
                      <option key={domain} value={domain}>
                        {domain === "all"
                          ? "All Domains"
                          : domain.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Sort */}
                <Col md={2}>
                  <Form.Label className="small text-muted">Sort By</Form.Label>
                  <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="progress">Progress</option>
                    <option value="duration">Duration</option>
                  </Form.Select>
                </Col>

                {/* View Mode & Results */}
                <Col md={1}>
                  <div className="d-flex flex-column gap-2">
                    <div className="btn-group" role="group">
                      <Button
                        variant={viewMode === "grid" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3x3Gap />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List />
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center">
                      <Filter className="me-2 text-muted" />
                      <span className="text-muted small">
                        {filteredPaths.length} of {learningPaths.length} paths
                      </span>
                    </div>
                    {(searchTerm || statusFilter !== "all" || difficultyFilter !== "all" || domainFilter !== "all") && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setDifficultyFilter("all")
                          setDomainFilter("all")
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Learning Paths Display */}
      {filteredPaths.length === 0 ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <BookmarkStar size={48} className="text-muted mb-3" />
            <h4>{learningPaths.length === 0 ? "No Learning Paths Yet" : "No Paths Match Your Filters"}</h4>
            <p className="text-muted">
              {learningPaths.length === 0
                ? "Create your first personalized learning path to get started!"
                : "Try adjusting your search or filter criteria."}
            </p>
            {learningPaths.length === 0 && (
              <Button variant="primary" onClick={() => navigate("/create-path")}>
                Create Learning Path
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : viewMode === "grid" ? (
        <Row>
          {filteredPaths.map((path) => (
            <Col lg={6} xl={4} key={path._id} className="mb-4">
              <Card className="h-100 shadow-sm border-0 hover-shadow">
                <Card.Body className="d-flex flex-column">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0 flex-grow-1 me-2">{path.title}</h5>
                    <div className="d-flex flex-column gap-1">
                      {getStatusBadge(path.status)}
                      {getDifficultyBadge(path.preferredDifficulty)}
                      {getDomainBadge(path.mlGeneratedContent?.domain)}
                    </div>
                  </div>

                  {/* Description */}
                  {path.description && (
                    <p className="text-muted small mb-3">
                      {path.description.length > 120 ? `${path.description.substring(0, 120)}...` : path.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mb-3">
                    <Row className="g-2 text-center">
                      <Col>
                        <div className="border rounded p-2">
                          <Clock size={16} className="text-muted mb-1" />
                          <div className="small">
                            <strong>{path.durationWeeks}</strong>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              weeks
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col>
                        <div className="border rounded p-2">
                          <Trophy size={16} className="text-muted mb-1" />
                          <div className="small">
                            <strong>{path.availableTimePerWeek}</strong>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              hrs/week
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col>
                        <div className="border rounded p-2">
                          <Bullseye size={16} className="text-muted mb-1" />
                          <div className="small">
                            <strong>{countResources(path)}</strong>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              resources
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Progress</small>
                      <small className="fw-bold">{calculateProgress(path)}%</small>
                    </div>
                    <ProgressBar
                      now={calculateProgress(path)}
                      variant={calculateProgress(path) === 100 ? "success" : "primary"}
                      style={{ height: "8px" }}
                    />
                  </div>

                  {/* Resource Preview */}
                  {path.mlGeneratedContent?.resources && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Resources:</small>
                      {renderResourcePreview(path.mlGeneratedContent.resources)}
                    </div>
                  )}

                  {/* Goals Preview */}
                  {path.goals && path.goals.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Goals:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {path.goals.slice(0, 2).map((goal, index) => (
                          <Badge key={index} bg="light" text="dark" className="small">
                            {goal.length > 15 ? `${goal.substring(0, 15)}...` : goal}
                          </Badge>
                        ))}
                        {path.goals.length > 2 && (
                          <Badge bg="light" text="dark" className="small">
                            +{path.goals.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <small className="text-muted">
                        <Calendar size={12} className="me-1" />
                        Created {formatDate(path.createdAt)}
                      </small>
                      {path.progress?.last_activity && (
                        <small className="text-muted">Last activity {formatDate(path.progress.last_activity)}</small>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <Button variant="primary" size="sm" onClick={() => navigate(`/learning-path/${path._id}`)}>
                        <Eye size={14} className="me-1" />
                        View Details
                      </Button>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleViewDetails(path)}
                        >
                          <Award size={14} className="me-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-fill"
                          onClick={() => {
                            setPathToDelete(path)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash size={14} className="me-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        // List View
        <div className="d-flex flex-column gap-3">
          {filteredPaths.map((path) => (
            <Card key={path._id} className="shadow-sm border-0">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <div
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <BookmarkStar size={24} className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">{path.title}</h5>
                        <p className="text-muted small mb-2">
                          {path.description
                            ? path.description.length > 100
                              ? `${path.description.substring(0, 100)}...`
                              : path.description
                            : "No description available"}
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                          {getStatusBadge(path.status)}
                          {getDifficultyBadge(path.preferredDifficulty)}
                          {getDomainBadge(path.mlGeneratedContent?.domain)}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="mb-2">
                        <small className="text-muted">Progress</small>
                        <div className="fw-bold">{calculateProgress(path)}%</div>
                      </div>
                      <ProgressBar
                        now={calculateProgress(path)}
                        variant={calculateProgress(path) === 100 ? "success" : "primary"}
                        style={{ height: "6px" }}
                      />
                    </div>
                    <div className="row g-1 mt-2 text-center small">
                      <div className="col">
                        <div className="text-muted">Duration</div>
                        <div className="fw-medium">{path.durationWeeks}w</div>
                      </div>
                      <div className="col">
                        <div className="text-muted">Hours/week</div>
                        <div className="fw-medium">{path.availableTimePerWeek}h</div>
                      </div>
                      <div className="col">
                        <div className="text-muted">Resources</div>
                        <div className="fw-medium">{countResources(path)}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="d-flex flex-column gap-2">
                      <Button variant="primary" size="sm" onClick={() => navigate(`/learning-path/${path._id}`)}>
                        <Eye size={14} className="me-1" />
                        View Details
                      </Button>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleViewDetails(path)}
                        >
                          <Award size={14} className="me-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-fill"
                          onClick={() => {
                            setPathToDelete(path)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            <BookmarkStar className="me-2" />
            {selectedPath?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPath && (
            <Tabs activeKey={activeModalTab} onSelect={(k) => setActiveModalTab(k)}>
              <Tab eventKey="overview" title="Overview">
                <div className="mt-3">
                  {/* Path Overview */}
                  <Card className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <h6 className="text-muted mb-2">Description</h6>
                          <p>{selectedPath.description || "No description provided."}</p>

                          <h6 className="text-muted mb-2 mt-3">Learning Goals</h6>
                          {selectedPath.goals && selectedPath.goals.length > 0 ? (
                            <ul className="mb-0">
                              {selectedPath.goals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted mb-0">No specific goals defined.</p>
                          )}

                          {/* ML Generated Overview */}
                          {selectedPath.mlGeneratedContent?.overview && (
                            <div className="mt-3">
                              <h6 className="text-muted mb-2">AI-Generated Overview</h6>
                              <p className="text-muted">{selectedPath.mlGeneratedContent.overview}</p>
                            </div>
                          )}
                        </Col>
                        <Col md={4}>
                          <h6 className="text-muted mb-2">Details</h6>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {getStatusBadge(selectedPath.status)}
                            {getDifficultyBadge(selectedPath.preferredDifficulty)}
                            {getDomainBadge(selectedPath.mlGeneratedContent?.domain)}
                          </div>

                          <div className="row g-2 text-center mb-3">
                            <div className="col-6">
                              <div className="border rounded p-2">
                                <Clock className="text-muted mb-1" />
                                <div>
                                  <strong>{selectedPath.durationWeeks}</strong> weeks
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="border rounded p-2">
                                <Trophy className="text-muted mb-1" />
                                <div>
                                  <strong>{selectedPath.availableTimePerWeek}</strong> hrs/week
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h6 className="text-muted mb-2">Progress</h6>
                            <ProgressBar
                              now={calculateProgress(selectedPath)}
                              label={`${calculateProgress(selectedPath)}%`}
                              variant={calculateProgress(selectedPath) === 100 ? "success" : "primary"}
                            />
                          </div>

                          <div>
                            <h6 className="text-muted mb-2">Resources Available</h6>
                            <div className="small">
                              Total: <strong>{countResources(selectedPath)}</strong> resources
                            </div>
                            {selectedPath.mlGeneratedContent?.resources && (
                              <div className="mt-2">
                                {renderResourcePreview(selectedPath.mlGeneratedContent.resources)}
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              </Tab>

              <Tab eventKey="curriculum" title="Curriculum">
                <div className="mt-3">
                  {selectedPath.mlGeneratedContent?.weekly_plan ? (
                    <div>
                      <h6 className="mb-3">
                        Weekly Learning Plan ({selectedPath.mlGeneratedContent.weekly_plan.length} weeks)
                      </h6>
                      <div className="row">
                        {selectedPath.mlGeneratedContent.weekly_plan.slice(0, 6).map((week, index) => (
                          <div key={week.week} className="col-md-6 mb-3">
                            <Card className="h-100">
                              <Card.Body>
                                <div className="d-flex align-items-center mb-2">
                                  <Badge bg="primary" className="me-2">
                                    Week {week.week}
                                  </Badge>
                                  <h6 className="mb-0">{week.primary_topic}</h6>
                                </div>
                                <p className="small text-muted mb-2">{week.focus}</p>
                                <div className="small">
                                  <strong>Phase:</strong> {week.phase}
                                  <br />
                                  <strong>Hours:</strong> {week.estimated_hours}
                                </div>
                                {week.subtopics && week.subtopics.length > 0 && (
                                  <div className="mt-2">
                                    <div className="d-flex flex-wrap gap-1">
                                      {week.subtopics.slice(0, 3).map((subtopic, idx) => (
                                        <Badge key={idx} bg="light" text="dark" className="small">
                                          {subtopic}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                      </div>
                      {selectedPath.mlGeneratedContent.weekly_plan.length > 6 && (
                        <div className="text-center">
                          <small className="text-muted">
                            Showing first 6 weeks. View full curriculum in the detailed view.
                          </small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert variant="info">
                      <h6>Curriculum Not Available</h6>
                      <p className="mb-0">The detailed weekly curriculum is being generated.</p>
                    </Alert>
                  )}
                </div>
              </Tab>

              <Tab eventKey="resources" title="Resources">
                <div className="mt-3">
                  {selectedPath.mlGeneratedContent?.resources ? (
                    <Row>
                      {/* Videos */}
                      {selectedPath.mlGeneratedContent.resources.videos?.length > 0 && (
                        <Col md={6} className="mb-4">
                          <Card>
                            <Card.Header className="bg-light">
                              <h6 className="mb-0">
                                <Youtube className="me-2 text-danger" />
                                Videos ({selectedPath.mlGeneratedContent.resources.videos.length})
                              </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <ListGroup variant="flush">
                                {selectedPath.mlGeneratedContent.resources.videos.slice(0, 3).map((video, index) => (
                                  <ListGroup.Item key={index}>
                                    <div className="d-flex align-items-start">
                                      <Youtube size={20} className="text-danger me-2 mt-1" />
                                      <div>
                                        <div className="fw-medium small">{video.title}</div>
                                        <div className="text-muted small">{video.description?.substring(0, 60)}...</div>
                                        {video.url && (
                                          <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="small"
                                          >
                                            Watch video
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                                {selectedPath.mlGeneratedContent.resources.videos.length > 3 && (
                                  <ListGroup.Item className="text-center text-muted small">
                                    +{selectedPath.mlGeneratedContent.resources.videos.length - 3} more videos
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}

                      {/* Projects */}
                      {selectedPath.mlGeneratedContent.resources.projects?.length > 0 && (
                        <Col md={6} className="mb-4">
                          <Card>
                            <Card.Header className="bg-light">
                              <h6 className="mb-0">
                                <Github className="me-2" />
                                Projects ({selectedPath.mlGeneratedContent.resources.projects.length})
                              </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <ListGroup variant="flush">
                                {selectedPath.mlGeneratedContent.resources.projects
                                  .slice(0, 3)
                                  .map((project, index) => (
                                    <ListGroup.Item key={index}>
                                      <div className="d-flex align-items-start">
                                        <Github size={20} className="me-2 mt-1" />
                                        <div>
                                          <div className="fw-medium small">{project.title}</div>
                                          <div className="text-muted small">
                                            {project.description?.substring(0, 60)}...
                                          </div>
                                          <div className="d-flex align-items-center gap-2 mt-1">
                                            {project.stars && (
                                              <small className="text-muted">
                                                <StarFill size={10} className="text-warning me-1" />
                                                {project.stars}
                                              </small>
                                            )}
                                            {project.url && (
                                              <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="small"
                                              >
                                                View project
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </ListGroup.Item>
                                  ))}
                                {selectedPath.mlGeneratedContent.resources.projects.length > 3 && (
                                  <ListGroup.Item className="text-center text-muted small">
                                    +{selectedPath.mlGeneratedContent.resources.projects.length - 3} more projects
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}

                      {/* Articles */}
                      {selectedPath.mlGeneratedContent.resources.articles?.length > 0 && (
                        <Col md={6} className="mb-4">
                          <Card>
                            <Card.Header className="bg-light">
                              <h6 className="mb-0">
                                <FileText className="me-2 text-primary" />
                                Articles ({selectedPath.mlGeneratedContent.resources.articles.length})
                              </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <ListGroup variant="flush">
                                {selectedPath.mlGeneratedContent.resources.articles
                                  .slice(0, 3)
                                  .map((article, index) => (
                                    <ListGroup.Item key={index}>
                                      <div className="d-flex align-items-start">
                                        <FileText size={20} className="text-primary me-2 mt-1" />
                                        <div>
                                          <div className="fw-medium small">{article.title}</div>
                                          <div className="text-muted small">
                                            {article.description?.substring(0, 60)}...
                                          </div>
                                          {article.url && (
                                            <a
                                              href={article.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="small"
                                            >
                                              Read article
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </ListGroup.Item>
                                  ))}
                                {selectedPath.mlGeneratedContent.resources.articles.length > 3 && (
                                  <ListGroup.Item className="text-center text-muted small">
                                    +{selectedPath.mlGeneratedContent.resources.articles.length - 3} more articles
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}

                      {/* Courses */}
                      {selectedPath.mlGeneratedContent.resources.courses?.length > 0 && (
                        <Col md={6} className="mb-4">
                          <Card>
                            <Card.Header className="bg-light">
                              <h6 className="mb-0">
                                <Mortarboard className="me-2 text-success" />
                                Courses ({selectedPath.mlGeneratedContent.resources.courses.length})
                              </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <ListGroup variant="flush">
                                {selectedPath.mlGeneratedContent.resources.courses.slice(0, 3).map((course, index) => (
                                  <ListGroup.Item key={index}>
                                    <div className="d-flex align-items-start">
                                      <Mortarboard size={20} className="text-success me-2 mt-1" />
                                      <div>
                                        <div className="fw-medium small">{course.title}</div>
                                        <div className="text-muted small">
                                          {course.description?.substring(0, 60)}...
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                          {course.free && (
                                            <Badge bg="success" className="small">
                                              Free
                                            </Badge>
                                          )}
                                          {course.url && (
                                            <a
                                              href={course.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="small"
                                            >
                                              View course
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                                {selectedPath.mlGeneratedContent.resources.courses.length > 3 && (
                                  <ListGroup.Item className="text-center text-muted small">
                                    +{selectedPath.mlGeneratedContent.resources.courses.length - 3} more courses
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      <h6>Resources Not Available</h6>
                      <p className="mb-0">Learning resources are being curated for this path.</p>
                    </Alert>
                  )}
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => navigate(`/learning-path/${selectedPath?._id}`)}>
            View Full Details
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the learning path
            <strong> "{pathToDelete?.title}"</strong>?
          </p>
          <p className="text-muted small">
            This action cannot be undone. All progress and data associated with this path will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeletePath(pathToDelete._id)}>
            <Trash className="me-1" />
            Delete Path
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </Container>
  )
}

export default ViewPaths
