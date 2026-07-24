import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

export default function SidebarGroup({ item, collapsed }) {
  const location = useLocation()
  const isChildActive = item.children.some(c =>
    location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)
  )
  const [open, setOpen] = useState(isChildActive)

  useEffect(() => {
    if (isChildActive) setOpen(true)
  }, [isChildActive])

  const Icon = item.icon

  return (
    <div style={{ marginBottom: 2 }}>
      <div
        onClick={() => setOpen(o => !o)}
        title={collapsed ? item.title : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '9px 0' : '9px 10px', borderRadius: 8,
          cursor: 'pointer', fontSize: 12, fontWeight: 500,
          color: isChildActive ? '#fff' : 'rgba(255,255,255,.55)',
          background: isChildActive ? '#1a56db' : 'transparent',
          transition: 'all .15s',
        }}
      >
        <span style={{ width: 18, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} />
        </span>
        {!collapsed && (
          <>
            <span style={{ flex: 1 }}>{item.title}</span>
            <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
          </>
        )}
      </div>

      {!collapsed && open && (
        <div style={{ marginLeft: 20, marginTop: 2, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,.1)' }}>
          {item.children.map(child => {
            const ChildIcon = child.icon
            return (
              <NavLink
                key={child.key}
                to={child.path}
                end={child.end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 6, marginBottom: 2,
                  fontSize: 11.5, fontWeight: 500, textDecoration: 'none',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                  background: isActive ? '#1a56db' : 'transparent',
                  transition: 'all .15s',
                })}
              >
                {ChildIcon && <ChildIcon size={12} />}
                {child.title}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}
