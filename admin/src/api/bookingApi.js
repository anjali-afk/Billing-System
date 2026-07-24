import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function fetchBookings() {
  return axios.get(`${API_URL}/bookings`)
}

export function fetchBooking(id) {
  return axios.get(`${API_URL}/bookings/${id}`)
}

export function updateBooking(id, payload) {
  return axios.put(`${API_URL}/bookings/${id}`, payload)
}

export function generateInvoiceNumber(id) {
  return axios.post(`${API_URL}/bookings/${id}/generate-invoice-number`)
}
