import { Routes, Route } from "react-router-dom"
import { UserProvider } from "./components/common/UserContext"

// Pages without layout
import Face from "./components/pages/Face"
import Login from "./components/pages/Login"
import Register from "./components/pages/Register"

// Pages with layout
import Home from "./components/pages/Home"
import Dashboard from "./components/pages/Dashboard"
import CreatePath from "./components/pages/CreatePath"
import ViewPaths from "./components/pages/ViewPaths"
import About from "./components/pages/About"
import Profile from "./components/pages/Profile"
import Settings from "./components/pages/Settings"
import LearningPathDetails from "./components/pages/LearningPathDetails"

// Layout components
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"

// Styles
import "./App.css"

const App = () => {
  return (
    <UserProvider>
      <Routes>
        {/* Routes WITHOUT layout (landing, auth pages) */}
        <Route path="/" element={<Face />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes WITH Sidebar and Header layout */}
        <Route
          path="/home"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/create-path"
          element={
            <AppLayout>
              <CreatePath />
            </AppLayout>
          }
        />
        <Route
          path="/viewpaths"
          element={
            <AppLayout>
              <ViewPaths />
            </AppLayout>
          }
        />
        <Route
          path="/about"
          element={
            <AppLayout>
              <About />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route
          path="/learning-path/:pathId"
          element={
            <AppLayout>
              <LearningPathDetails />
            </AppLayout>
          }
        />
      </Routes>
    </UserProvider>
  )
}

// Inline Layout Component - replaces SidebarLayout.jsx
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

export default App
