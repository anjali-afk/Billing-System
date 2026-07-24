import { NavLink } from 'react-router-dom'

export default function SidebarItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.end}
      title={collapsed ? item.title : undefined}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px 0' : '9px 10px', borderRadius: 8, marginBottom: 2,
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
        background: isActive ? '#1a56db' : 'transparent',
        transition: 'all .15s',
      })}
    >
      <span style={{ width: 18, display: 'flex', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        <Icon size={14} />
        {collapsed && item.badge && (
          <span style={{
            position: 'absolute', top: -4, right: -2,
            width: 6, height: 6, borderRadius: '50%',
            background: '#ef4444',
          }} />
        )}
      </span>
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{item.title}</span>
          {item.badge && (
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: 9, fontWeight: 700,
              padding: '2px 6px', borderRadius: 100,
            }}>{item.badge}</span>
          )}
        </>
      )}
    </NavLink>
  )
}
