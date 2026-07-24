import { TriangleAlert } from 'lucide-react'
import Card from '../../components/common/Card.jsx'

export default function NotFound() {
  return (
    <Card icon={TriangleAlert} title="404 — Page Not Found">
      <p style={{ fontSize: 13, color: '#64748b' }}>The page you're looking for doesn't exist.</p>
    </Card>
  )
}
