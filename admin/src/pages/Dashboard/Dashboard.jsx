import { useEffect, useMemo } from 'react'
import { useBookings } from '../../hooks/useBookings.js'
import BookingsPanel from '../../components/bookings/BookingsPanel.jsx'

const AUTO_REFRESH_MS = 15000

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function bookingDateStr(r) {
  return r.date || (r.created_at ? r.created_at.slice(0, 10) : '')
}

/* Dashboard shows only bookings created today. It reuses the exact same
   table/filters/actions/edit/invoice logic as the All Bookings page
   (BookingsPanel) — only the input data (today's bookings vs. every
   booking) differs between the two pages. */
export default function Dashboard() {
  const { bookings, setBookings, loading, error, reload } = useBookings()

  // Polls the existing bookings API on an interval so a booking created
  // today (e.g. from the separate customer-facing flight-sale app) shows
  // up on the Dashboard without a manual page refresh.
  useEffect(() => {
    const id = setInterval(reload, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [reload])

  const todaysBookings = useMemo(() => {
    const today = todayStr()
    return bookings.filter(r => bookingDateStr(r) === today)
  }, [bookings])

  return (
    <BookingsPanel
      bookings={todaysBookings}
      setBookings={setBookings}
      loading={loading}
      error={error}
      reload={reload}
      title="Today's Bookings"
      emptyMessage="No bookings for today"
    />
  )
}
