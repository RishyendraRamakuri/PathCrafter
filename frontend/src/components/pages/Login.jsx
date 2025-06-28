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
import { useNavigate } from 'react-router-dom';
import { LockFill, EnvelopeFill } from 'react-bootstrap-icons';

const Login = () => {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Navigation hook
  const navigate = useNavigate();

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Make login request
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      // Extract user data and token from response
      const { id, name, email: userEmail, token } = response.data;

      // Store user data and token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id,
        name,
        email: userEmail
      }));

      // Navigate to view paths page
      navigate('/home');
    } catch (err) {
      // Handle login error
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Row className="justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Login to PathCrafter</h2>
                <p className="text-muted">Access your personalized learning paths</p>
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

              {/* Login Form */}
              <Form onSubmit={handleLogin}>
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

                <Form.Group className="mb-4">
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
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>

              {/* Additional Links */}
              <div className="text-center mt-3">
                <p className="small text-muted">
                  Don't have an account? <a href="/register">Sign up</a>
                </p>
                <p className="small text-muted">
                  <a href="/forgot-password">Forgot password?</a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;