import { fetchParties, createParty, updateParty, deleteParty as deletePartyApi } from '../api/partyApi.js'

function normalizeParty(p) {
  return {
    id: p.id,
    companyId: p.company_id,
    partyType: p.party_type ?? '',
    customerCode: p.customer_code ?? '',
    accountName: p.account_name ?? '',
    address: p.address ?? '',
    placeOfSupply: p.place_of_supply ?? '',
    gstin: p.gstin ?? '',
  }
}

export async function getParties(companyId) {
  if (!companyId) return []
  const { data } = await fetchParties(companyId)
  return Array.isArray(data) ? data.map(normalizeParty) : []
}

export async function saveParty(payload, id = null) {
  const body = {
    company_id: payload.companyId,
    party_type: payload.partyType || null,
    customer_code: payload.customerCode || null,
    account_name: payload.accountName,
    address: payload.address || null,
    place_of_supply: payload.placeOfSupply || null,
    gstin: payload.gstin || null,
  }
  const { data } = id ? await updateParty(id, body) : await createParty(body)
  return normalizeParty(data)
}

export async function deleteParty(id) {
  await deletePartyApi(id)
}
