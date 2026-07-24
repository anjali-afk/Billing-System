import { Hotel, RefreshCw, TriangleAlert } from 'lucide-react'
import { useHotelQuickBookings } from '../../hooks/useHotelQuickBookings.js'
import Loader from '../../components/common/Loader.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'

function fmtMoney(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

function fmtDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_COLORS = {
  Confirmed: { bg: '#dcfce7', color: '#15803d' },
  Pending: { bg: '#fef9c3', color: '#854d0e' },
  Received: { bg: '#dcfce7', color: '#15803d' },
  Sent: { bg: '#dcfce7', color: '#15803d' },
  'Not Required': { bg: '#f1f5f9', color: '#64748b' },
  'Full Paid': { bg: '#dcfce7', color: '#15803d' },
  Partial: { bg: '#fef9c3', color: '#854d0e' },
}

function StatusBadge({ value }) {
  if (!value) return null
  const { bg, color } = STATUS_COLORS[value] || { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: bg, color }}>
      {value}
    </span>
  )
}

const td = { padding: '10px 12px', fontSize: 12, color: '#1e293b', whiteSpace: 'nowrap' }

const COLUMNS = [
  'Ref No.', 'Date', 'Guest Name', 'Destination', 'Hotel Name',
  'Check-In', 'Check-Out', 'Nights', 'Rooms', 'Total Pax',
  'Room Category', 'Meal Plan', 'Hotel Status', 'Billing Status',
  'Grand Total', 'Balance', 'Payment Status',
]

export default function HotelBookings() {
  const { bookings, loading, error, reload } = useHotelQuickBookings()

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <Hotel size={16} /> Hotel Bookings
          </div>
          <button
            onClick={reload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#1e293b' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading && <Loader message="Loading hotel bookings…" />}

        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 40, color: '#ef4444', fontSize: 13 }}>
            <TriangleAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {COLUMNS.map(label => (
                    <th key={label} style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && <EmptyState colSpan={COLUMNS.length} message="No Hotel Bookings Found" />}
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ ...td, fontWeight: 700, fontFamily: 'monospace' }}>{b.refNo}</td>
                    <td style={td}>{fmtDate(b.createdAt)}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{b.guestName}</td>
                    <td style={td}>{b.destination}</td>
                    <td style={td}>{b.hotelName}</td>
                    <td style={td}>{fmtDate(b.checkIn)}</td>
                    <td style={td}>{fmtDate(b.checkOut)}</td>
                    <td style={td}>{b.nights}</td>
                    <td style={td}>{b.numRooms}</td>
                    <td style={td}>{b.totalPax}</td>
                    <td style={td}>{b.roomCategory}</td>
                    <td style={td}>{b.mealPlan}</td>
                    <td style={td}><StatusBadge value={b.hotelStatus} /></td>
                    <td style={td}><StatusBadge value={b.billingStatus} /></td>
                    <td style={{ ...td, fontWeight: 700 }}>{fmtMoney(b.grandTotal)}</td>
                    <td style={{ ...td, color: b.balanceAmount > 0 ? '#e8400a' : '#15803d', fontWeight: 700 }}>{fmtMoney(b.balanceAmount)}</td>
                    <td style={td}><StatusBadge value={b.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
