import { Link } from "react-router-dom"
import { Speedometer, PlusCircle, ListTask, BookmarkStar } from "react-bootstrap-icons"
import "./Home.css"

function Home() {
  const quickLinks = [
    {
      title: "Dashboard",
      description: "Overview of your learning progress",
      icon: <Speedometer />,
      path: "/dashboard",
      color: "primary",
    },
    {
      title: "Create Path",
      description: "Start a new learning journey",
      icon: <PlusCircle />,
      path: "/create-path",
      color: "success",
    },
    {
      title: "View Paths",
      description: "Explore your existing paths",
      icon: <ListTask />,
      path: "/viewpaths",
      color: "info",
    },
    {
      title: "Recommended",
      description: "Paths curated for you",
      icon: <BookmarkStar />,
      path: "/recommended",
      color: "warning",
    },
  ]

  return (
    <div className="home-dashboard">
      <div className="container-fluid">
        {/* Welcome Section */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="display-6 mb-3">Welcome to PathCrafter</h1>
            <p className="text-muted lead">
              Explore your learning journey and unlock your potential with our intelligent learning platform
            </p>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="row g-4 justify-content-center">
          {quickLinks.map((link, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <Link
                to={link.path}
                className={`card quick-link-card border-0 shadow-sm bg-${link.color} bg-opacity-10 text-decoration-none`}
              >
                <div className="card-body d-flex align-items-center">
                  <div className={`icon-wrapper bg-${link.color} text-white me-3`}>{link.icon}</div>
                  <div>
                    <h5 className="card-title mb-1">{link.title}</h5>
                    <p className="card-text text-muted small mb-0">{link.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="row mt-5 pt-5">
          <div className="col-12 text-center mb-4">
            <h2 className="h3 mb-3">Why Choose PathCrafter?</h2>
            <p className="text-muted">Discover the features that make learning more effective and enjoyable</p>
          </div>

          <div className="col-md-4 mb-4">
            <div className="text-center">
              <div className="feature-icon mb-3">🎯</div>
              <h5>Personalized Learning</h5>
              <p className="text-muted">AI-powered recommendations tailored to your learning style and goals</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="text-center">
              <div className="feature-icon mb-3">📊</div>
              <h5>Progress Tracking</h5>
              <p className="text-muted">
                Detailed analytics and insights to monitor your learning journey and achievements
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="text-center">
              <div className="feature-icon mb-3">🚀</div>
              <h5>Interactive Learning</h5>
              <p className="text-muted">Engaging content and hands-on exercises to accelerate your progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
