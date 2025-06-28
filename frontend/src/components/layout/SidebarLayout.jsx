"use client"

import React from "react"
import Sidebar from "./Sidebar"

function SidebarLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

export default SidebarLayout
