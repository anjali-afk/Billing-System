export default function Card({ icon: Icon, title, children }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{
        background: '#fff', borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            {Icon && <Icon size={16} />} {title}
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
