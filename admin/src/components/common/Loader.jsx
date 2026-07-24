export default function Loader({ message = 'Loading…' }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>
      {message}
    </div>
  )
}
