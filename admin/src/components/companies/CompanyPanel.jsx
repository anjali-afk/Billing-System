import { useState } from 'react'
import { Building2, TriangleAlert, Pencil, Trash2, Plus, X } from 'lucide-react'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { saveCompany, deleteCompany } from '../../services/companyService.js'

const emptyForm = {
  name: '', address: '', website: '', email: '', gstin: '', pan: '',
  bankName: '', accountNumber: '', ifscCode: '', terms: '', notes: '',
}

/* Company master — feeds the Company dropdown on the Party (Customers) page. */
export default function CompanyPanel({ companies, loading, error, reload }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = companies.filter(c => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [c.name, c.gstin, c.email].some(v => v && v.toLowerCase().includes(q))
  })

  const openAdd = () => { setEditing('new'); setForm(emptyForm); setFormError('') }
  const openEdit = (c) => {
    setEditing(c.id)
    setForm({
      name: c.name, address: c.address, website: c.website, email: c.email,
      gstin: c.gstin, pan: c.pan, bankName: c.bankName, accountNumber: c.accountNumber,
      ifscCode: c.ifscCode, terms: c.terms, notes: c.notes,
    })
    setFormError('')
  }
  const closeForm = () => setEditing(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await saveCompany(form, editing === 'new' ? null : editing)
      await reload()
      setEditing(null)
    } catch (err) {
      setFormError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c) => {
    if (!confirm(`Delete company "${c.name}"? This will also delete its parties.`)) return
    await deleteCompany(c.id)
    await reload()
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <Building2 size={16} /> Companies
          </div>
          <Button blue onClick={openAdd}><Plus size={14} /> Add Company</Button>
        </div>

        <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company name, GSTIN, email…"
            style={{ ...inpStyle, minWidth: 280 }}
          />
        </div>

        {loading && <Loader message="Loading companies…" />}
        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 40, color: '#ef4444', fontSize: 13 }}>
            <TriangleAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Name', 'GSTIN', 'Email', 'Website', 'Actions'].map(label => (
                    <th key={label} style={th}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}><div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div></td>
                    <td style={td}>{c.gstin || '—'}</td>
                    <td style={td}>{c.email || '—'}</td>
                    <td style={td}>{c.website || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button title="Edit" style={iconBtn('#f0fdf4', '#15803d')} onClick={() => openEdit(c)}><Pencil size={13} /></button>{' '}
                      <button title="Delete" style={iconBtn('#fef2f2', '#dc2626')} onClick={() => remove(c)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <EmptyState colSpan={5} message="No companies found" />}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div style={overlay}>
          <form onSubmit={submit} style={modal}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{editing === 'new' ? 'Add Company' : 'Edit Company'}</div>
              <button type="button" onClick={closeForm} style={iconBtn('#f8fafc', '#475569')}><X size={14} /></button>
            </div>

            {formError && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>{formError}</div>}

            <div style={grid2}>
              <Field label="Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
              <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              <Field label="GSTIN" value={form.gstin} onChange={v => setForm({ ...form, gstin: v })} maxLength={15} />
              <Field label="PAN" value={form.pan} onChange={v => setForm({ ...form, pan: v })} maxLength={10} />
              <Field label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
              <Field label="Bank Name" value={form.bankName} onChange={v => setForm({ ...form, bankName: v })} />
              <Field label="Account Number" value={form.accountNumber} onChange={v => setForm({ ...form, accountNumber: v })} />
              <Field label="IFSC Code" value={form.ifscCode} onChange={v => setForm({ ...form, ifscCode: v })} />
            </div>
            <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} textarea />
            <Field label="Terms" value={form.terms} onChange={v => setForm({ ...form, terms: v })} textarea />
            <Field label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} textarea />

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
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} style={{ ...inpStyle, width: '100%', resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength} style={{ ...inpStyle, width: '100%' }} />
      )}
    </div>
  )
}

const th = { padding: '10px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }
const td = { padding: '10px 12px', fontSize: 12, verticalAlign: 'middle', color: '#1e293b' }
const inpStyle = { padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff' }
const iconBtn = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, padding: 0, border: `1px solid ${color}22`, borderRadius: 6, cursor: 'pointer', background: bg, color })
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }
const modal = { background: '#fff', borderRadius: 12, padding: 24, width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,.2)' }
