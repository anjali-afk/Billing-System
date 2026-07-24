import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function fetchParties(companyId) {
  return axios.get(`${API_URL}/parties`, { params: { company_id: companyId } })
}

export function createParty(payload) {
  return axios.post(`${API_URL}/parties`, payload)
}

export function updateParty(id, payload) {
  return axios.put(`${API_URL}/parties/${id}`, payload)
}

export function deleteParty(id) {
  return axios.delete(`${API_URL}/parties/${id}`)
}
