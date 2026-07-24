import { useEffect, useState } from 'react'
import SidebarLogo from './SidebarLogo.jsx'
import SidebarMenu from './SidebarMenu.jsx'

export default function Sidebar({ onOpenChange }) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  return (
    <aside
      style={{
        width: isOpen ? 220 : 64, background: '#0f1f3d',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 200, overflowY: 'auto', overflowX: 'hidden',
        transition: 'width 0.2s ease',
      }}
    >
      <SidebarLogo collapsed={!isOpen} onToggle={() => setIsOpen(open => !open)} />
      <SidebarMenu collapsed={!isOpen} />
    </aside>
  )
}
