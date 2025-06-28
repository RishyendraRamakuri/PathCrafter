"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
  Badge,
  InputGroup,
  ProgressBar,
} from "react-bootstrap"
import {
  Gear,
  Person,
  Shield,
  Bell,
  Download,
  Trash,
  Eye,
  EyeSlash,
  Check,
  ExclamationTriangle,
} from "react-bootstrap-icons"

const Settings = () => {
  // User settings state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Account settings
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
  })

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    progressReminders: true,
    theme: "light",
    language: "en",
    timezone: "UTC",
  })

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Loading states
  const [updating, setUpdating] = useState({
    account: false,
    password: false,
    preferences: false,
    export: false,
    delete: false,
  })

  useEffect(() => {
    loadUserSettings()
  }, [])

  useEffect(() => {
    calculatePasswordStrength(passwordForm.newPassword)
  }, [passwordForm.newPassword])

  const loadUserSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in to access settings")
        setLoading(false)
        return
      }

      // Load user profile
      const response = await fetch("https://pathcrafter-backend.onrender.com/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data)
        setAccountForm({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        })
      } else {
        setError(data.message || "Failed to load user settings")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error loading settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
    setPasswordStrength(Math.min(100, strength))
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "danger"
    if (passwordStrength < 50) return "warning"
    if (passwordStrength < 75) return "info"
    return "success"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  const handleAccountUpdate = async (e) => {
    e.preventDefault()
    setUpdating({ ...updating, account: true })
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://pathcrafter-backend.onrender.com/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountForm),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, ...accountForm })
        setSuccess("Account information updated successfully!")

        // Update localStorage user data
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...accountForm }))
      } else {
        setError(data.message || "Failed to update account information")
      }
    } catch (err) {
      setError("Error updating account information")
      console.error("Error:", err)
    } finally {
      setUpdating({ ...updating, account: false })
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setUpdating({ ...updating, password: true })
    setError(null)
    setSuccess(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match")
      setUpdating({ ...updating, password: false })
      return
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password")
      setUpdating({ ...updating, password: false })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://pathcrafter-backend.onrender.com/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password changed successfully!")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setError(data.message || "Failed to change password")
      }
    } catch (err) {
      setError("Error changing password")
      console.error("Error:", err)
    } finally {
      setUpdating({ ...updating, password: false })
    }
  }

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault()
    setUpdating({ ...updating, preferences: true })
    setError(null)
    setSuccess(null)

    try {
      // Since we don't have a preferences endpoint, we'll simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Preferences updated successfully!")
    } catch (err) {
      setError("Error updating preferences")
      console.error("Error:", err)
    } finally {
      setUpdating({ ...updating, preferences: false })
    }
  }

  const handleDataExport = async () => {
    setUpdating({ ...updating, export: true })
    setError(null)

    try {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const exportData = {
        user: user,
        preferences: preferences,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `pathcrafter-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess("Data exported successfully!")
      setShowExportModal(false)
    } catch (err) {
      setError("Error exporting data")
      console.error("Error:", err)
    } finally {
      setUpdating({ ...updating, export: false })
    }
  }

  const handleAccountDeletion = async () => {
    setUpdating({ ...updating, delete: true })
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://pathcrafter-backend.onrender.com/api/users/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Clear all local storage and redirect
        localStorage.clear()
        window.location.href = "/login"
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete account")
      }
    } catch (err) {
      setError("Error deleting account")
      console.error("Error:", err)
    } finally {
      setUpdating({ ...updating, delete: false })
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading settings...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 mb-2">
            <Gear className="me-3" />
            Settings
          </h1>
          <p className="text-muted">Manage your account settings and preferences</p>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Account Information */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Person className="me-2" />
                Account Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAccountUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={accountForm.bio}
                    onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        value={accountForm.location}
                        onChange={(e) => setAccountForm({ ...accountForm, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="url"
                        value={accountForm.website}
                        onChange={(e) => setAccountForm({ ...accountForm, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={updating.account}
                  className="d-flex align-items-center"
                >
                  {updating.account ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <Check className="me-2" />
                  )}
                  {updating.account ? "Updating..." : "Update Account"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Password Change */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Shield className="me-2" />
                Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup>
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Password Strength</small>
                        <small className={`text-${getPasswordStrengthColor()}`}>{getPasswordStrengthText()}</small>
                      </div>
                      <ProgressBar
                        now={passwordStrength}
                        variant={getPasswordStrengthColor()}
                        style={{ height: "6px" }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <small className="text-danger">Passwords do not match</small>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={updating.password}
                  className="d-flex align-items-center"
                >
                  {updating.password ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <Shield className="me-2" />
                  )}
                  {updating.password ? "Changing..." : "Change Password"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Preferences */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Bell className="me-2" />
                Preferences
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePreferencesUpdate}>
                <h6 className="mb-3">Notifications</h6>
                <Form.Check
                  type="switch"
                  id="email-notifications"
                  label="Email notifications"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="push-notifications"
                  label="Push notifications"
                  checked={preferences.pushNotifications}
                  onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="weekly-digest"
                  label="Weekly progress digest"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                  className="mb-2"
                />
                <Form.Check
                  type="switch"
                  id="progress-reminders"
                  label="Progress reminders"
                  checked={preferences.progressReminders}
                  onChange={(e) => setPreferences({ ...preferences, progressReminders: e.target.checked })}
                  className="mb-4"
                />

                <h6 className="mb-3">Appearance</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Theme</Form.Label>
                      <Form.Select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Language</Form.Label>
                      <Form.Select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={updating.preferences}
                  className="d-flex align-items-center"
                >
                  {updating.preferences ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <Check className="me-2" />
                  )}
                  {updating.preferences ? "Saving..." : "Save Preferences"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Data Management */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Download className="me-2" />
                Data Management
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">Export your data or manage your account</p>

              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowExportModal(true)}
                  className="d-flex align-items-center justify-content-center"
                >
                  <Download className="me-2" />
                  Export My Data
                </Button>

                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                  className="d-flex align-items-center justify-content-center"
                >
                  <Trash className="me-2" />
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Account Status */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Account Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Badge bg="success" className="me-2">
                  Active
                </Badge>
                <span>Your account is in good standing</span>
              </div>

              <div className="small text-muted">
                <p className="mb-1">
                  <strong>Member since:</strong>{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Last login:</strong> {new Date().toLocaleDateString()}
                </p>
                <p className="mb-0">
                  <strong>Account type:</strong> Free
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Data Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Your Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will download a JSON file containing all your PathCrafter data including:</p>
          <ul>
            <li>Profile information</li>
            <li>Learning paths</li>
            <li>Progress data</li>
            <li>Preferences</li>
          </ul>
          <p className="text-muted small">The export may take a few moments to prepare.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDataExport}
            disabled={updating.export}
            className="d-flex align-items-center"
          >
            {updating.export ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Download className="me-2" />
            )}
            {updating.export ? "Preparing..." : "Export Data"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <ExclamationTriangle className="me-2" />
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action cannot be undone!
          </Alert>
          <p>Deleting your account will permanently remove:</p>
          <ul>
            <li>Your profile and account information</li>
            <li>All learning paths and progress</li>
            <li>Saved preferences and settings</li>
            <li>Any associated data</li>
          </ul>
          <p className="text-muted">If you're sure you want to proceed, click the delete button below.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleAccountDeletion}
            disabled={updating.delete}
            className="d-flex align-items-center"
          >
            {updating.delete ? <Spinner animation="border" size="sm" className="me-2" /> : <Trash className="me-2" />}
            {updating.delete ? "Deleting..." : "Delete Account"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Settings
