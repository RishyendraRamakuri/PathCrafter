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

  // Navigation hook
  const navigate = useNavigate();

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Make registration request
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name,
        email,
        password
      });

      // Extract user data and token from response
      const { id, name: userName, email: userEmail, token } = response.data;

      // Store user data and token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id,
        name: userName,
        email: userEmail
      }));

      // Navigate to view paths page
      navigate('/home');
    } catch (err) {
      // Handle registration error
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      setLoading(false);
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
                  onClose={() => setError(null)} 
                  dismissible
                >
                  {error}
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
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <LockFill className="me-2" />
                    Confirm Password
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
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