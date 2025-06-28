"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { UserContext } from "../common/UserContext"
import LogoImage from "../../assets/PathCrafter.png"
import {
  House,
  Speedometer2,
  PlusCircle,
  BookHalf,
  Search,
  Gear,
  BoxArrowRight,
  GraphUp,
  Bullseye,
  ChevronLeft,
  ChevronRight,
  X,
  List,
} from "react-bootstrap-icons"
import "./Sidebar.css"

function Sidebar() {
  const { user, logout } = useContext(UserContext)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [searchQuery, setSearchQuery] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const location = useLocation()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && !isCollapsed) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isCollapsed])

  // Add this useEffect after the existing ones
  useEffect(() => {
    const checkTheme = () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.body.getAttribute("data-theme") === "dark" ||
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")

      // Force re-render when theme changes
      setIsCollapsed((prev) => prev)
    }

    // Check theme on mount
    checkTheme()

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    })

    return () => observer.disconnect()
  }, [])

  // Navigation items
  const navItems = [
    {
      path: "/home",
      icon: House,
      label: "Home",
    },
    {
      path: "/dashboard",
      icon: Speedometer2,
      label: "Dashboard",
    },
    {
      path: "/create-path",
      icon: PlusCircle,
      label: "Create Path",
      badge: "New",
    },
    {
      path: "/viewpaths",
      icon: BookHalf,
      label: "My Paths",
    },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const closeSidebar = () => {
    setIsVisible(false)
  }

  const openSidebar = () => {
    setIsVisible(true)
    setIsCollapsed(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
      // Implement search logic here
    }
  }

  // If sidebar is hidden, show floating toggle button
  if (!isVisible) {
    return (
      <button className="sidebar-floating-toggle" onClick={openSidebar} aria-label="Open Sidebar">
        <List size={20} />
      </button>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && <div className="sidebar-overlay" onClick={() => setIsCollapsed(true)} />}

      <div className={`modern-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobile ? "mobile" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img src={LogoImage || "/placeholder.svg"} alt="PathCrafter" className="logo-image" />
            {!isCollapsed && <span className="logo-text">PathCrafter</span>}
          </Link>

          <div className="sidebar-controls">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Always show close button */}
            <button className="sidebar-close" onClick={closeSidebar} aria-label="Close Sidebar">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} alt="Profile" />
              ) : (
                <div className="avatar-fallback">{(user.name || user.username || "U").charAt(0).toUpperCase()}</div>
              )}
              <div className="online-indicator"></div>
            </div>

            {!isCollapsed && (
              <div className="user-info">
                <div className="user-name">{user.name || user.username}</div>
                <div className="user-status">Active Learner</div>
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="sidebar-search">
            <form onSubmit={handleSearch} className="search-form">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                placeholder="Search paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.Bullseye.value)}
                className="search-input"
              />
            </form>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">Navigation</div>}

            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <div className="nav-icon">
                    <IconComponent size={20} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Quick Stats - Only show when expanded */}
        {!isCollapsed && (
          <div className="sidebar-stats">
            <div className="stats-header">
              <h4>Quick Stats</h4>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <Bullseye size={16} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{user?.activePaths || 0}</span>
                  <span className="stat-label">Active Paths</span>
                </div>
              </div>
              <div className="stat-card">
                <GraphUp size={16} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{user?.completedPaths || 0}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="footer-actions">
            <Link to="/settings" className="footer-action" title={isCollapsed ? "Settings" : ""}>
              <Gear size={18} />
              {!isCollapsed && <span>Settings</span>}
            </Link>

            {user && (
              <button onClick={logout} className="footer-action logout" title={isCollapsed ? "Logout" : ""}>
                <BoxArrowRight size={18} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
