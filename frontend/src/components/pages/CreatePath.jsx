"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../common/UserContext"
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge } from "react-bootstrap"
import { BookmarkStar, LightningCharge, Code, Database } from "react-bootstrap-icons"

const CreatePath = () => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)

  // EXPANDED domains from the Enhanced ML service LEARNING_DATABASE
  const domains = {
    "web-development": {
      name: "Web Development",
      icon: <Code size={24} />,
      color: "primary",
      description: "Build websites and web applications",
      defaultGoals: [
        "Build responsive websites with HTML and CSS",
        "Create interactive web pages with JavaScript",
        "Understand web development fundamentals",
        "Deploy websites to the internet",
        "Use version control with Git",
      ],
      sampleTopics: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB"],
    },
    "data-science": {
      name: "Data Science",
      icon: <Database size={24} />,
      color: "success",
      description: "Analyze data and build machine learning models",
      defaultGoals: [
        "Analyze data using Python and pandas",
        "Create meaningful data visualizations",
        "Understand statistical concepts for data analysis",
        "Clean and prepare data for analysis",
        "Build basic machine learning models",
      ],
      sampleTopics: ["Python", "Pandas", "NumPy", "Machine Learning", "Statistics", "Data Visualization"],
    },
    "mobile-development": {
      name: "Mobile Development",
      icon: <Code size={24} />,
      color: "info",
      description: "Build mobile apps for iOS and Android",
      defaultGoals: [
        "Create native mobile applications",
        "Understand mobile UI/UX principles",
        "Implement mobile-specific features",
        "Deploy apps to app stores",
        "Handle mobile performance optimization",
      ],
      sampleTopics: ["React Native", "Flutter", "Swift", "Kotlin", "Mobile UI", "App Store"],
    },
    cybersecurity: {
      name: "Cybersecurity",
      icon: <Database size={24} />,
      color: "danger",
      description: "Learn security principles and ethical hacking",
      defaultGoals: [
        "Understand network security fundamentals",
        "Learn ethical hacking techniques",
        "Implement security best practices",
        "Conduct security assessments",
        "Understand compliance frameworks",
      ],
      sampleTopics: ["Network Security", "Penetration Testing", "Cryptography", "OWASP", "Security Auditing"],
    },
    "cloud-computing": {
      name: "Cloud Computing",
      icon: <Database size={24} />,
      color: "warning",
      description: "Master cloud platforms and services",
      defaultGoals: [
        "Deploy applications to cloud platforms",
        "Understand cloud architecture patterns",
        "Implement cloud security measures",
        "Optimize cloud costs and performance",
        "Use Infrastructure as Code",
      ],
      sampleTopics: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform"],
    },
    devops: {
      name: "DevOps",
      icon: <Code size={24} />,
      color: "secondary",
      description: "Learn CI/CD and infrastructure automation",
      defaultGoals: [
        "Set up CI/CD pipelines",
        "Automate infrastructure deployment",
        "Implement monitoring and logging",
        "Practice Infrastructure as Code",
        "Understand containerization",
      ],
      sampleTopics: ["Jenkins", "Docker", "Kubernetes", "Ansible", "Terraform", "Monitoring"],
    },
    "machine-learning": {
      name: "Machine Learning",
      icon: <Database size={24} />,
      color: "success",
      description: "Build and deploy ML models",
      defaultGoals: [
        "Understand ML algorithms and concepts",
        "Build predictive models",
        "Work with neural networks",
        "Deploy ML models to production",
        "Handle real-world ML projects",
      ],
      sampleTopics: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Deep Learning", "MLOps"],
    },
    blockchain: {
      name: "Blockchain",
      icon: <Code size={24} />,
      color: "dark",
      description: "Develop decentralized applications",
      defaultGoals: [
        "Understand blockchain fundamentals",
        "Develop smart contracts",
        "Build decentralized applications",
        "Work with cryptocurrency protocols",
        "Implement blockchain security",
      ],
      sampleTopics: ["Solidity", "Ethereum", "Web3", "Smart Contracts", "DeFi", "NFTs"],
    },
  }

  // EXACT difficulty levels from ML service
  const skillLevels = {
    beginner: {
      name: "Beginner",
      description: "No prior experience in this field",
      icon: "🌱",
    },
    intermediate: {
      name: "Intermediate",
      description: "Familiar with basic concepts",
      icon: "🌿",
    },
    advanced: {
      name: "Advanced",
      description: "Can build complex projects",
      icon: "🌳",
    },
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "",
    goals: [],
    preferredDifficulty: "beginner",
    availableTimePerWeek: 10,
    durationWeeks: 12,
    preferredTopics: [],
    customGoals: [""],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // When domain changes, update goals and generate title
  useEffect(() => {
    if (formData.domain) {
      const domainData = domains[formData.domain]
      const difficulty = skillLevels[formData.preferredDifficulty]

      const title = `${domainData.name} Learning Path (${difficulty.name})`
      const description = `A comprehensive learning path to master ${domainData.name.toLowerCase()} with a focus on practical skills and projects. Designed for ${difficulty.name.toLowerCase()} learners.`

      setFormData((prev) => ({
        ...prev,
        title,
        description,
        goals: domainData.defaultGoals,
        preferredTopics: domainData.sampleTopics.slice(0, 3), // Add some default topics
      }))
    }
  }, [formData.domain, formData.preferredDifficulty])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCustomGoalChange = (index, value) => {
    const newCustomGoals = [...formData.customGoals]
    newCustomGoals[index] = value
    setFormData((prev) => ({
      ...prev,
      customGoals: newCustomGoals,
    }))
  }

  const addCustomGoal = () => {
    setFormData((prev) => ({
      ...prev,
      customGoals: [...prev.customGoals, ""],
    }))
  }

  const removeCustomGoal = (index) => {
    if (formData.customGoals.length > 1) {
      const newCustomGoals = formData.customGoals.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        customGoals: newCustomGoals,
      }))
    }
  }

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.preferredTopics]
    newTopics[index] = value
    setFormData((prev) => ({
      ...prev,
      preferredTopics: newTopics,
    }))
  }

  const addTopic = () => {
    setFormData((prev) => ({
      ...prev,
      preferredTopics: [...prev.preferredTopics, ""],
    }))
  }

  const removeTopic = (index) => {
    if (formData.preferredTopics.length > 0) {
      const newTopics = formData.preferredTopics.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        preferredTopics: newTopics,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Please log in to create a learning path")
      }

      // Combine default goals with custom goals (filter out empty ones)
      const allGoals = [...formData.goals, ...formData.customGoals.filter((goal) => goal.trim() !== "")]

      // Filter out empty topics
      const cleanTopics = formData.preferredTopics.filter((topic) => topic.trim() !== "")

      // Prepare data in EXACT format expected by ML service
      const apiData = {
        title: formData.title,
        description: formData.description,
        goals: allGoals,
        preferredDifficulty: formData.preferredDifficulty, // ML service expects this exact field name
        availableTimePerWeek: Number(formData.availableTimePerWeek), // ML service expects this exact field name
        durationWeeks: Number(formData.durationWeeks), // ML service expects this exact field name
        preferredTopics: cleanTopics, // ML service expects this exact field name
      }

      // Replace this line:
      // console.log("Sending data to ML service:", apiData)

      // With this:
      console.log("=== DEBUGGING PATH CREATION ===")
      console.log("Raw form data:", formData)
      console.log("Processed API data:", JSON.stringify(apiData, null, 2))
      console.log("API data keys:", Object.keys(apiData))
      console.log(
        "API data types:",
        Object.keys(apiData).map((key) => `${key}: ${typeof apiData[key]}`),
      )
      console.log("===============================")

      const response = await fetch("https://pathcrafter-backend.onrender.com/api/ml/generate-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()
      // Replace this line:
      // console.log("ML service response:", result)

      // With this:
      console.log("=== ML SERVICE RESPONSE ===")
      console.log("Status:", response.status)
      console.log("Response:", JSON.stringify(result, null, 2))
      console.log("==========================")

      if (!response.ok) {
        throw new Error(result.message || "Failed to create learning path")
      }

      setSuccess("Learning path created successfully!")
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            message: "Learning path created successfully!",
            pathId: result.pathId,
          },
        })
      }, 2000)
    } catch (error) {
      console.error("Error creating path:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="create-path-container py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white text-center py-4">
              <BookmarkStar size={48} className="mb-3" />
              <h2 className="mb-2">Create Your Learning Path</h2>
              <p className="mb-0 opacity-75">Choose from our available domains</p>
            </Card.Header>

            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    {success} Redirecting to dashboard...
                  </div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Domain Selection */}
                <Form.Group className="mb-4">
                  <Form.Label>Select Learning Domain *</Form.Label>
                  <Row className="g-3">
                    {Object.entries(domains).map(([key, domain]) => (
                      <Col md={6} key={key}>
                        <Card
                          className={`h-100 cursor-pointer border-2 ${
                            formData.domain === key
                              ? `border-${domain.color} bg-${domain.color} bg-opacity-10`
                              : "border-light"
                          }`}
                          onClick={() => setFormData((prev) => ({ ...prev, domain: key }))}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Body className="text-center p-4">
                            <div className={`text-${domain.color} mb-3`}>{domain.icon}</div>
                            <h5 className="mb-2">{domain.name}</h5>
                            <p className="text-muted small mb-0">{domain.description}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Form.Group>

                {/* Title & Description (auto-generated but editable) */}
                {formData.domain && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Learning Path Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Auto-generated based on your selections, but you can customize it.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </>
                )}

                {/* Difficulty */}
                <Form.Group className="mb-4">
                  <Form.Label>Difficulty Level *</Form.Label>
                  <div className="d-flex gap-2">
                    {Object.entries(skillLevels).map(([key, level]) => (
                      <Button
                        key={key}
                        variant={formData.preferredDifficulty === key ? "success" : "outline-success"}
                        className="flex-grow-1"
                        onClick={() => setFormData((prev) => ({ ...prev, preferredDifficulty: key }))}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <span className="fs-4">{level.icon}</span>
                          <span>{level.name}</span>
                          <small className="text-muted">{level.description}</small>
                        </div>
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                {/* Time and Duration */}
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hours per Week *</Form.Label>
                      <Form.Control
                        type="number"
                        name="availableTimePerWeek"
                        value={formData.availableTimePerWeek}
                        onChange={handleInputChange}
                        min="1"
                        max="40"
                        required
                      />
                      <Form.Text className="text-muted">How many hours can you dedicate weekly?</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Duration (Weeks) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="durationWeeks"
                        value={formData.durationWeeks}
                        onChange={handleInputChange}
                        min="1"
                        max="52"
                        required
                      />
                      <Form.Text className="text-muted">How long should your learning path be?</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Default Goals */}
                {formData.domain && (
                  <Form.Group className="mb-4">
                    <Form.Label>Learning Goals</Form.Label>
                    <Card className="bg-light">
                      <Card.Body>
                        <p className="mb-2">Your path will include these goals:</p>
                        {formData.goals.map((goal, index) => (
                          <Badge key={index} bg="primary" className="me-2 mb-2">
                            {goal}
                          </Badge>
                        ))}
                      </Card.Body>
                    </Card>
                  </Form.Group>
                )}

                {/* Custom Goals */}
                <Form.Group className="mb-4">
                  <Form.Label>Additional Custom Goals (Optional)</Form.Label>
                  {formData.customGoals.map((goal, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        value={goal}
                        onChange={(e) => handleCustomGoalChange(index, e.target.value)}
                        placeholder="Add a custom learning goal..."
                      />
                      {formData.customGoals.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => removeCustomGoal(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline-primary" size="sm" onClick={addCustomGoal}>
                    Add Custom Goal
                  </Button>
                </Form.Group>

                {/* Preferred Topics */}
                <Form.Group className="mb-4">
                  <Form.Label>Preferred Topics</Form.Label>
                  {formData.preferredTopics.map((topic, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        placeholder="E.g., React, Python, Machine Learning..."
                      />
                      <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => removeTopic(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline-secondary" size="sm" onClick={addTopic}>
                    Add Topic
                  </Button>
                  <Form.Text className="text-muted d-block mt-2">
                    These topics help the AI customize your learning path.
                  </Form.Text>
                </Form.Group>

                {/* Submit Button */}
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading || !formData.domain || !formData.title}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Your Path...
                      </>
                    ) : (
                      <>
                        <LightningCharge className="me-2" />
                        Create Learning Path
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CreatePath
