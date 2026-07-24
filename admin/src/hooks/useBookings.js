import { useEffect, useState, useCallback } from 'react'
import { getBookings } from '../services/bookingService.js'

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBookings()
      setBookings(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { bookings, setBookings, loading, error, reload: load }
}
