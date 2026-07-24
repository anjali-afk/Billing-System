import { useEffect, useState, useCallback } from 'react'
import { getCompanies } from '../services/companyService.js'

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { companies, setCompanies, loading, error, reload: load }
}
