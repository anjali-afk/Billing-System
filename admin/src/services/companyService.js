import { fetchCompanies, createCompany, updateCompany, deleteCompany as deleteCompanyApi } from '../api/companyApi.js'

function normalizeCompany(c) {
  return {
    id: c.id,
    name: c.name ?? '',
    address: c.address ?? '',
    website: c.website ?? '',
    logoPath: c.logo_path ?? '',
    email: c.email ?? '',
    gstin: c.gstin ?? '',
    pan: c.pan ?? '',
    bankName: c.bank_name ?? '',
    accountNumber: c.account_number ?? '',
    ifscCode: c.ifsc_code ?? '',
    terms: c.terms ?? '',
    notes: c.notes ?? '',
  }
}

export async function getCompanies() {
  const { data } = await fetchCompanies()
  return Array.isArray(data) ? data.map(normalizeCompany) : []
}

export async function saveCompany(payload, id = null) {
  const body = {
    name: payload.name,
    address: payload.address || null,
    website: payload.website || null,
    email: payload.email || null,
    gstin: payload.gstin || null,
    pan: payload.pan || null,
    bank_name: payload.bankName || null,
    account_number: payload.accountNumber || null,
    ifsc_code: payload.ifscCode || null,
    terms: payload.terms || null,
    notes: payload.notes || null,
  }
  const { data } = id ? await updateCompany(id, body) : await createCompany(body)
  return normalizeCompany(data)
}

export async function deleteCompany(id) {
  await deleteCompanyApi(id)
}
