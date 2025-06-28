import React from 'react';
import { Link } from 'react-router-dom';
import { GraphUp } from 'react-bootstrap-icons';
import './Face.css'; // Optional: for custom styles

function Face() {
  return (
    <div className="face-section container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 text-center">
          {/* Learning Icon */}
          <div className="mb-4 d-flex justify-content-center">
            <GraphUp 
              className="text-primary" 
              style={{ 
                fontSize: '4rem', 
                opacity: 0.7 
              }} 
            />
          </div>

          {/* Main Heading */}
          <h1 className="display-4 mb-3 fw-bold">
            PathCrafter: Your Learning Roadmap
          </h1>

          {/* Subheading */}
          <p className="lead text-muted mb-4">
            Personalized learning paths powered by AI, helping you transform 
            your skills and achieve your career goals efficiently.
          </p>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-3">
            <Link 
              to="/login" 
              className="btn btn-primary btn-lg px-4"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-outline-primary btn-lg px-4"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Face;