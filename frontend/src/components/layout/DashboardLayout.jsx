import { Outlet } from "react-router-dom"
import Header from "./Header"
import SidebarLayout from "./SidebarLayout"

function DashboardLayout() {
  return (
    <SidebarLayout>
      <div className="dashboard-content">
        <Header />
        <div className="page-content">
          <Outlet /> {/* This will render child routes */}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DashboardLayout
