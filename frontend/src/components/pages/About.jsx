import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="container-fluid about-container p-4">
      {/* Intro Section */}
      <section className="row mb-5">
        <div className="col-12 text-center">
          <h1 className="display-4 mb-4">About PathCrafter</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
            PathCrafter is a personalized learning path generator that helps learners 
            stay on track and achieve their goals. We transform your learning ambitions 
            into structured, actionable roadmaps tailored to your unique skills and aspirations.
          </p>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Our Key Features</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100 feature-card">
                <div className="card-body text-center">
                  <span className="feature-icon mb-3">🎯</span>
                  <h5 className="card-title">Goal-Driven Paths</h5>
                  <p className="card-text text-muted">
                    Create personalized learning journeys aligned with your specific career and personal development goals.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 feature-card">
                <div className="card-body text-center">
                  <span className="feature-icon mb-3">🧠</span>
                  <h5 className="card-title">Smart Recommendations</h5>
                  <p className="card-text text-muted">
                    AI-powered suggestions that adapt to your learning style, pace, and progress.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 feature-card">
                <div className="card-body text-center">
                  <span className="feature-icon mb-3">📊</span>
                  <h5 className="card-title">Progress Tracking</h5>
                  <p className="card-text text-muted">
                    Comprehensive dashboards and analytics to monitor your learning journey and achievements.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 feature-card">
                <div className="card-body text-center">
                  <span className="feature-icon mb-3">🔒</span>
                  <h5 className="card-title">Secure & User-Friendly</h5>
                  <p className="card-text text-muted">
                    Robust security measures and an intuitive interface designed for seamless learning experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">How PathCrafter Works</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="d-flex justify-content-between align-items-center">
                <div className="step-box text-center">
                  <div className="step-number">1</div>
                  <h5>Input Goal</h5>
                  <p className="text-muted">Define your learning objective</p>
                </div>
                <div className="step-arrow">→</div>
                <div className="step-box text-center">
                  <div className="step-number">2</div>
                  <h5>Get Custom Path</h5>
                  <p className="text-muted">Receive a tailored learning roadmap</p>
                </div>
                <div className="step-arrow">→</div>
                <div className="step-box text-center">
                  <div className="step-number">3</div>
                  <h5>Learn & Track</h5>
                  <p className="text-muted">Progress through your personalized journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="row">
        <div className="col-12 text-center">
          <h2 className="mb-4">Our Vision</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
            At PathCrafter, we believe in democratizing learning by providing 
            personalized, accessible, and engaging educational experiences. 
            Our platform is designed for ambitious learners, career changers, 
            and lifelong learners who are committed to continuous personal and 
            professional growth.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
