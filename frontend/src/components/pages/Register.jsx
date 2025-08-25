import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { 
  PersonFill, 
  EnvelopeFill, 
  LockFill 
} from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  // State management
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // Password validation helper
  const validatePassword = (pwd) => {
    const requirements = [
      { test: pwd.length >= 8, text: "At least 8 characters long" },
      { test: /[a-z]/.test(pwd), text: "One lowercase letter (a-z)" },
      { test: /[A-Z]/.test(pwd), text: "One uppercase letter (A-Z)" },
      { test: /\d/.test(pwd), text: "One number (0-9)" },
      { test: /[@$!%*?&]/.test(pwd), text: "One special character (@$!%*?&)" }
    ];
    return requirements;
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    // Password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Make registration request
      const response = await axios.post('https://pathcrafter-backend.onrender.com/api/users/register', {
        name,
        email,
        password
      });

      // Extract user data and token from response
      const { user } = response.data;

      // Store user data and token in localStorage
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));

      // Navigate to view paths page
      navigate('/home');
    } catch (err) {
      setLoading(false);
      
      // Handle detailed validation errors
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message);
      } else {
        setError(
          err.response?.data?.message || 
          'Registration failed. Please try again.'
        );
      }
    }
  };

  return (
    <Container className="register-container">
      <Row className="justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Create an Account</h2>
                <p className="text-muted">Join PathCrafter and start your learning journey</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert 
                  variant="danger" 
                  onClose={() => {
                    setError(null);
                    setValidationErrors([]);
                  }} 
                  dismissible
                >
                  <div>{error}</div>
                  {validationErrors.length > 0 && (
                    <ul className="mb-0 mt-2">
                      {validationErrors.map((err, index) => (
                        <li key={index} className="small">{err.msg}</li>
                      ))}
                    </ul>
                  )}
                </Alert>
              )}

              {/* Registration Form */}
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <PersonFill className="me-2" />
                    Full Name
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <EnvelopeFill className="me-2" />
                    Email address
                  </Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <LockFill className="me-2" />
                    Password
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Create a strong password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    required
                    minLength={8}
                  />
                  
                  {/* Password Requirements */}
                  {showPasswordRequirements && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        <strong>Password must include:</strong>
                      </small>
                      {validatePassword(password).map((req, index) => (
                        <div key={index} className="small d-flex align-items-center">
                          <span 
                            className={`me-2 ${req.test ? 'text-success' : 'text-muted'}`}
                          >
                            {req.test ? '✓' : '○'}
                          </span>
                          <span className={req.test ? 'text-success' : 'text-muted'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <LockFill className="me-2" />
                    Confirm Password
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className={
                      confirmPassword && password !== confirmPassword 
                        ? 'is-invalid' 
                        : confirmPassword && password === confirmPassword 
                        ? 'is-valid' 
                        : ''
                    }
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <div className="invalid-feedback">
                      Passwords do not match
                    </div>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <div className="valid-feedback">
                      Passwords match!
                    </div>
                  )}
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner 
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  ) : null}
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>

              {/* Additional Links */}
              <div className="text-center mt-3">
                <p className="small text-muted">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;