import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function fetchCompanies() {
  return axios.get(`${API_URL}/companies`)
}

export function createCompany(payload) {
  return axios.post(`${API_URL}/companies`, payload)
}

export function updateCompany(id, payload) {
  return axios.put(`${API_URL}/companies/${id}`, payload)
}

export function deleteCompany(id) {
  return axios.delete(`${API_URL}/companies/${id}`)
}
