import { useMemo } from 'react'
import { useBookings } from '../../hooks/useBookings.js'
import BookingsPanel from '../../components/bookings/BookingsPanel.jsx'
import { isTrainBooking } from '../../utils/bookingType.js'

/* Same table/filters/actions/edit flow as All Bookings (BookingsPanel) —
   just fed only train-service bookings. Edit routes to TrainSaleForm
   automatically inside BookingsPanel, based on each row's own service. */
export default function TrainBookings() {
  const { bookings, setBookings, loading, error, reload } = useBookings()
  const trainBookings = useMemo(() => bookings.filter(isTrainBooking), [bookings])

  return (
    <BookingsPanel
      bookings={trainBookings}
      setBookings={setBookings}
      loading={loading}
      error={error}
      reload={reload}
      title="Train Bookings"
      emptyMessage="No Train Bookings Found"
      airlineFilterLabel="All Suppliers"
    />
  )
}
