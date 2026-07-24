export default function Button({ children, blue, outline, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px',
      background: blue ? '#1a56db' : '#fff',
      color:      blue ? '#fff'    : '#1e293b',
      border:     blue ? 'none'    : '1.5px solid #e2e8f0',
      borderRadius: 8, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>{children}</button>
  )
}
