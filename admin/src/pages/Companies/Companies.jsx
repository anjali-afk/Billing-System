import { useCompanies } from '../../hooks/useCompanies.js'
import CompanyPanel from '../../components/companies/CompanyPanel.jsx'

export default function Companies() {
  const { companies, loading, error, reload } = useCompanies()

  return (
    <CompanyPanel
      companies={companies}
      loading={loading}
      error={error}
      reload={reload}
    />
  )
}
