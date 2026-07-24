import logo from '../../assets/images/tripnavigatelogo.png'

export default function SidebarLogo({ collapsed, onToggle }) {
  return (
    <div style={{
      padding: collapsed ? '22px 0 18px' : '22px 20px 18px',
      borderBottom: '1px solid rgba(255,255,255,.08)',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 4,
      }}>
        <img
          src={logo}
          alt="Holiday Chacha"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onToggle()
            }
          }}
          style={{
            height: 36, width: 'auto', maxWidth: '100%',
            objectFit: 'contain', cursor: 'pointer', flexShrink: 0,
          }}
        />
        {!collapsed && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Holiday Chacha</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>CRM Dashboard</div>
          </div>
        )}
      </div>
    </div>
  )
}
