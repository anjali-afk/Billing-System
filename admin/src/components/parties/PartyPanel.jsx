import { useState, useMemo, useEffect } from 'react'
import { Users, TriangleAlert, Pencil, Trash2, Plus, X } from 'lucide-react'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { useCompanies } from '../../hooks/useCompanies.js'
import { useParties } from '../../hooks/useParties.js'
import { saveParty, deleteParty } from '../../services/partyService.js'

const PARTY_TYPES = ['Travel Agent', 'Direct Customer']

const emptyForm = {
  partyType: '', customerCode: '', accountName: '', address: '', placeOfSupply: '', gstin: '',
}

/* Party (Customer/Agent) master, scoped per company — selecting a company
   filters the party list exactly like the old Customer_Master sheet did. */
export default function PartyPanel() {
  const { companies, loading: companiesLoading } = useCompanies()
  const [companyId, setCompanyId] = useState('')
  const { parties, loading, error, reload } = useParties(companyId || null)

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!companyId && companies.length > 0) setCompanyId(String(companies[0].id))
  }, [companies, companyId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return parties
    return parties.filter(p =>
      [p.accountName, p.customerCode, p.gstin, p.partyType].some(v => v && v.toLowerCase().includes(q))
    )
  }, [parties, search])

  const openAdd = () => {
    if (!companyId) return
    setEditing('new')
    setForm(emptyForm)
    setFormError('')
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      partyType: p.partyType, customerCode: p.customerCode, accountName: p.accountName,
      address: p.address, placeOfSupply: p.placeOfSupply, gstin: p.gstin,
    })
    setFormError('')
  }

  const closeForm = () => setEditing(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await saveParty({ ...form, companyId }, editing === 'new' ? null : editing)
      await reload()
      setEditing(null)
    } catch (err) {
      setFormError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!confirm(`Delete party "${p.accountName}"?`)) return
    await deleteParty(p.id)
    await reload()
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <Users size={16} /> Customers
          </div>
          <Button blue onClick={openAdd}><Plus size={14} /> Add Customer</Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <select
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
            style={{ ...inpStyle, cursor: 'pointer', minWidth: 200 }}
          >
            <option value="" disabled>{companiesLoading ? 'Loading companies…' : 'Select Company'}</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search account name, customer code, GSTIN…"
            style={{ ...inpStyle, minWidth: 280 }}
          />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>Showing {filtered.length} of {parties.length}</span>
        </div>

        {!companyId && !companiesLoading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>Select a company to view its customers.</div>
        )}

        {companyId && loading && <Loader message="Loading customers…" />}

        {companyId && !loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 40, color: '#ef4444', fontSize: 13 }}>
            <TriangleAlert size={14} /> {error}
          </div>
        )}

        {companyId && !loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Customer Code', 'Account Name', 'Party Type', 'Place of Supply', 'GSTIN', 'Actions'].map(label => (
                    <th key={label} style={th}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}><span style={{ fontFamily: 'monospace' }}>{p.customerCode || '—'}</span></td>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.accountName}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{p.address || ''}</div>
                    </td>
                    <td style={td}>{p.partyType || '—'}</td>
                    <td style={td}>{p.placeOfSupply || '—'}</td>
                    <td style={td}>{p.gstin || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button title="Edit" style={iconBtn('#f0fdf4', '#15803d')} onClick={() => openEdit(p)}><Pencil size={13} /></button>{' '}
                      <button title="Delete" style={iconBtn('#fef2f2', '#dc2626')} onClick={() => remove(p)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyState colSpan={6} message="No Customers Found" />}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div style={overlay}>
          <form onSubmit={submit} style={modal}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{editing === 'new' ? 'Add Customer' : 'Edit Customer'}</div>
              <button type="button" onClick={closeForm} style={iconBtn('#f8fafc', '#475569')}><X size={14} /></button>
            </div>

            {formError && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>{formError}</div>}

            <div style={grid2}>
              <Field label="Account Name *" value={form.accountName} onChange={v => setForm({ ...form, accountName: v })} required />
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Party Type</label>
                <select value={form.partyType} onChange={e => setForm({ ...form, partyType: e.target.value })} style={{ ...inpStyle, width: '100%', cursor: 'pointer' }}>
                  <option value="">—</option>
                  {PARTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Field label="Customer Code" value={form.customerCode} onChange={v => setForm({ ...form, customerCode: v })} />
              <Field label="Place of Supply" value={form.placeOfSupply} onChange={v => setForm({ ...form, placeOfSupply: v })} />
              <Field label="GSTIN" value={form.gstin} onChange={v => setForm({ ...form, gstin: v })} maxLength={15} />
            </div>
            <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} textarea />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button outline onClick={closeForm}>Cancel</Button>
              <Button blue disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required, maxLength, textarea }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} style={{ ...inpStyle, width: '100%', resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength} style={{ ...inpStyle, width: '100%' }} />
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }
const th = { padding: '10px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }
const td = { padding: '10px 12px', fontSize: 12, verticalAlign: 'middle', color: '#1e293b' }
const inpStyle = { padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff' }
const iconBtn = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, padding: 0, border: `1px solid ${color}22`, borderRadius: 6, cursor: 'pointer', background: bg, color })
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const modal = { background: '#fff', borderRadius: 12, padding: 24, width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,.2)' }
