import { useEffect, useState, useCallback } from 'react'
import { getHotelQuickBookings } from '../services/hotelQuickBookingService.js'

export function useHotelQuickBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHotelQuickBookings()
      setBookings(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load hotel bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { bookings, loading, error, reload: load }
}
