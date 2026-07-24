import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar.jsx'

const SIDEBAR_WIDTH = 220
const SIDEBAR_WIDTH_COLLAPSED = 64

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onOpenChange={setSidebarOpen} />
      <div
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
          flex: 1, background: '#f1f5f9', minHeight: '100vh',
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}
