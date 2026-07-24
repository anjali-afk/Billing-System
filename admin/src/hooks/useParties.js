import { useEffect, useState, useCallback } from 'react'
import { getParties } from '../services/partyService.js'

export function useParties(companyId) {
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!companyId) {
      setParties([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getParties(companyId)
      setParties(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load parties')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { load() }, [load])

  return { parties, setParties, loading, error, reload: load }
}
