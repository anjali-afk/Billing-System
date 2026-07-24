import { useBookings } from '../../hooks/useBookings.js'
import BookingsPanel from '../../components/bookings/BookingsPanel.jsx'

/* All Bookings shows every booking regardless of date, using the exact
   same table/filters/actions/edit/invoice logic as the Dashboard page
   (BookingsPanel) — only the input data differs between the two pages. */
export default function Bookings() {
  const { bookings, setBookings, loading, error, reload } = useBookings()

  return (
    <BookingsPanel
      bookings={bookings}
      setBookings={setBookings}
      loading={loading}
      error={error}
      reload={reload}
      title="All Bookings"
      emptyMessage="No Bookings Found"
    />
  )
}
