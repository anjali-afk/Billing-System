import { Plus } from 'lucide-react'
import Card from '../../components/common/Card.jsx'

export default function NewInvoice() {
  return (
    <Card icon={Plus} title="New Invoice">
      <p style={{ fontSize: 13, color: '#64748b' }}>New Invoice — Coming Soon</p>
    </Card>
  )
}
