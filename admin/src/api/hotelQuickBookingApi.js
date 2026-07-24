import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function fetchHotelQuickBookings() {
  return axios.get(`${API_URL}/hotel-quick-bookings`)
}
