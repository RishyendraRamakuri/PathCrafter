"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Search,
  Bell,
  GearFill,
  PersonFill,
  BoxArrowRight,
  List,
  X,
  Sun,
  Moon,
  HouseFill,
  BarChartFill,
  BookFill,
  InfoCircleFill,
} from "react-bootstrap-icons"
import LogoImage from "../../assets/PathCrafter.png"
import { UserContext } from "../common/UserContext"
import "./Header.css"

const Header = () => {
  const { user, logout } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to PathCrafter!", type: "info", unread: true },
    { id: 2, message: "Your learning path is ready", type: "success", unread: true },
  ])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-theme")
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.body.classList.add("dark-theme")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-theme")
      localStorage.setItem("theme", "light")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: HouseFill },
    { path: "/viewpaths", label: "Learning Paths", icon: BookFill },
    { path: "/create-path", label: "Create Path", icon: BarChartFill },
    { path: "/about", label: "About", icon: InfoCircleFill },
  ]

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo">
          <Link to="/home" className="logo-link">
            <img src={LogoImage || "/placeholder.svg"} alt="PathCrafter" className="logo-image" />
            <span className="logo-text">PathCrafter</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="header-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search learning paths, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="action-btn theme-toggle">
            {isDarkMode ? <Sun /> : <Moon />}
          </button>

          {/* Notifications */}
          <div className="notification-wrapper">
            <button className="action-btn notification-btn">
              <Bell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                <PersonFill />
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user.name || user.username}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">
                  <PersonFill />
                  Profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <GearFill />
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <BoxArrowRight />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <List />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-content">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />}
    </header>
  )
}

export default Header
