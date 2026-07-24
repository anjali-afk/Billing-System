import { useState, useMemo } from 'react'
import {
  Plane, TriangleAlert, ClipboardList, ArrowUp, BarChart3, X,
  Eye, Pencil, Download,
} from 'lucide-react'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { getBooking, generateInvoiceNumber } from '../../services/bookingService.js'
import FlightSaleForm from '../FlightSaleForm.jsx'
import TrainSaleForm from '../TrainSaleForm.jsx'
import { bookingToFormData } from '../../utils/bookingToFormData.js'
import { trainToFormData } from '../../utils/trainToFormData.js'
import { isTrainBooking } from '../../utils/bookingType.js'
import InvoiceView from '../../pages/Invoice/InvoiceView.jsx'
import { buildInvoiceData } from '../../utils/buildInvoiceData.js'

const TYPES = ['All Types', 'Domestic', 'International']
const INVOICE_TYPE_OPTIONS = ['Invoice Print', 'GST Invoice', 'Net Invoice']
const INVOICE_TYPE_STORAGE_KEY = 'dashboardInvoiceTypeSelections'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const hh = date.getHours()
  const mins = String(date.getMinutes()).padStart(2, '0')
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h = hh % 12 || 12
  return `${String(date.getDate()).padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()} ${String(h).padStart(2, '0')}:${mins} ${ampm}`
}

/* Global search across every field the admin might search a booking by:
   invoice number, passenger name/phone, PNR variants (top-level + every
   passenger's), party/company/ref, and flight number (top-level segment +
   every passenger's + every segment's). */
function matchesSearch(r, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    r.invoiceNumber, r.passengerName, r.pnr, r.party, r.company, r.ref, r.flightNo,
    ...(r.passengers || []),
    ...(r.passengerDetails || []).flatMap(p => [p.passenger_name, p.cell_no, p.airline_pnr, p.crs_pnr, p.flight_no, p.ticket_no]),
    ...(r.segments || []).flatMap(s => [s.flightNo, s.airlinePnr, s.crsPnr]),
  ]

  return haystack.some(v => v != null && String(v).toLowerCase().includes(q))
}

/* Shared booking list + filters + table + View/Edit/Generate actions.
   Reused by both the Dashboard page (fed today-only bookings) and the
   All Bookings page (fed the full list) so the table, filters, pagination
   and edit/view/invoice flows only exist in one place. */
export default function BookingsPanel({ bookings: data, setBookings: setData, loading, error, reload, title = 'All Bookings', emptyMessage = 'No Bookings Found', airlineFilterLabel = 'All Airlines' }) {
  const [tab, setTab] = useState('all')
  const [airline, setAirline] = useState(airlineFilterLabel)
  const [type, setType] = useState('All Types')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState('dateTime')
  const [sortDir, setSortDir] = useState(-1)
  const [page, setPage] = useState(1)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [editingBooking, setEditingBooking] = useState(null)
  const [toast, setToast] = useState('')
  const [generatingId, setGeneratingId] = useState(null)
  const [invoiceTypeByBooking, setInvoiceTypeByBooking] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(INVOICE_TYPE_STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })
  const perPage = 5

  const handleInvoiceTypeChange = (bookingId, value) => {
    setInvoiceTypeByBooking(prev => {
      const next = { ...prev, [bookingId]: value }
      try {
        localStorage.setItem(INVOICE_TYPE_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore storage failures (e.g. private browsing)
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    let d = data.filter(r => {
      if (tab === 'confirmed' && r.status !== 'confirmed') return false
      if (tab === 'pending' && r.status !== 'pending') return false
      if (tab === 'tally' && r.tallySynced) return false
      if (airline !== airlineFilterLabel && r.airline !== airline) return false
      if (type !== 'All Types' && !String(r.service || r.type || '').toLowerCase().includes(type.toLowerCase())) return false
      if (dateFrom && r.travelDate < dateFrom) return false
      if (dateTo && r.travelDate > dateTo) return false
      if (!matchesSearch(r, search)) return false
      return true
    })

    d = [...d].sort((a, b) => {
      const av = sortCol === 'dateTime' ? (a.created_at || a.date) : sortCol === 'party' ? a.party : a.amount
      const bv = sortCol === 'dateTime' ? (b.created_at || b.date) : sortCol === 'party' ? b.party : b.amount
      return av > bv ? sortDir : av < bv ? -sortDir : 0
    })
    return d
  }, [data, tab, airline, type, dateFrom, dateTo, search, sortCol, sortDir, airlineFilterLabel])

  /* Options come from whatever's actually in the data (airline names for
     Flight, supplier names for Train) instead of a hardcoded flight airline
     list — so this dropdown never shows values that can't match any row. */
  const airlineOptions = useMemo(() => {
    const values = [...new Set(data.map(r => r.airline).filter(Boolean))].sort()
    return [airlineFilterLabel, ...values]
  }, [data, airlineFilterLabel])

  const pages = Math.ceil(filtered.length / perPage)
  const slice = filtered.slice((page - 1) * perPage, page * perPage)

  const counts = {
    all: data.length,
    confirmed: data.filter(r => r.status === 'confirmed').length,
    pending: data.filter(r => r.status === 'pending').length,
    tally: data.filter(r => !r.tallySynced).length,
  }

  const upcomingFlights = data.filter(r => {
    const d = new Date(r.travelDate) - new Date()
    return d > 0 && d <= 7 * 86400000
  }).length

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => -d)
    else { setSortCol(col); setSortDir(-1) }
  }

  const syncTally = (id) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, tallySynced: true } : r))
  }

  const exportCSV = () => {
    const headers = ['Date & Time', 'Passenger Name', 'PNR', 'Party', 'Route', 'Travel Date', 'Airline', 'Status', 'Amount']
    const rows = filtered.map(r =>
      [formatDateTime(r.created_at), r.passengerName, r.pnr, r.party, `${r.route.from} → ${r.route.to}`, r.travelDate, r.airline, r.status, r.amount].join(',')
    )
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bookings.csv'
    a.click()
  }

  const openView = async (booking) => {
    const detail = await getBooking(booking.id)
    setViewingInvoice(buildInvoiceData(detail, invoiceTypeByBooking[booking.id]))
  }

  const closeView = () => setViewingInvoice(null)

  const openEdit = async (booking) => {
    const detail = await getBooking(booking.id)
    const train = isTrainBooking(detail)
    setEditingBooking({
      id: detail.id,
      pnr: detail.pnr,
      isTrain: train,
      formData: train ? trainToFormData(detail) : bookingToFormData(detail),
    })
  }

  const closeEdit = () => setEditingBooking(null)

  const handleEditSaved = async () => {
    await reload()
    setEditingBooking(null)
    setToast('Booking updated successfully.')
    setTimeout(() => setToast(''), 3000)
  }

  /* First click on a booking assigns its permanent invoice number (backend
     no-ops and returns the existing one on every click after that); either
     way the same invoice is then opened using whatever number is now on
     the booking, exactly like the View button. */
  const generateInvoice = async (booking) => {
    setGeneratingId(booking.id)
    try {
      const invoiceNumber = await generateInvoiceNumber(booking.id)
      setData(prev => prev.map(r => r.id === booking.id ? { ...r, invoiceNumber } : r))
      const detail = await getBooking(booking.id)
      setViewingInvoice(buildInvoiceData(detail, invoiceTypeByBooking[booking.id]))
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to generate invoice')
    } finally {
      setGeneratingId(null)
    }
  }

  if (editingBooking) {
    return editingBooking.isTrain ? (
      <TrainSaleForm
        bookingId={editingBooking.id}
        initialData={editingBooking.formData}
        onBack={closeEdit}
        onSaved={handleEditSaved}
      />
    ) : (
      <FlightSaleForm
        bookingId={editingBooking.id}
        initialData={editingBooking.formData}
        onBack={closeEdit}
        onSaved={handleEditSaved}
      />
    )
  }

  if (viewingInvoice) {
    return <InvoiceView data={viewingInvoice} onBack={closeView} />
  }

  return (
    <div style={{ padding: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, background: '#15803d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
          {toast}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginBottom: 20 }}>
        <TopCard icon={Plane} label="Upcoming flights (7 days)" value={`${upcomingFlights} flights`} warn={upcomingFlights === 0} />
        <TopCard icon={TriangleAlert} label="Pending Tally entries" value={`${counts.tally} entries`} warn={counts.tally > 0} orange />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <ClipboardList size={16} /> {title}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button outline onClick={() => alert('Exporting to Tally...')}><ArrowUp size={14} /> Export All to Tally</Button>
            <Button blue onClick={exportCSV}><BarChart3 size={14} /> Export CSV</Button>
          </div>
        </div>

        {loading && <Loader message="Loading bookings…" />}

        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 40, color: '#ef4444', fontSize: 13 }}>
            <TriangleAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', padding: '0 20px' }}>
              {[
                ['all', `All ${counts.all}`],
                ['confirmed', `Confirmed ${counts.confirmed}`],
                ['pending', `Pending ${counts.pending}`],
                ['tally', `Tally Pending ${counts.tally}`],
              ].map(([key, label]) => (
                <div key={key} onClick={() => { setTab(key); setPage(1) }} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderBottom: tab === key ? '2px solid #1a56db' : '2px solid transparent', color: tab === key ? '#1a56db' : '#64748b', marginBottom: -2, transition: 'all .15s' }}>
                  {label}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search invoice no, passenger, PNR, phone, party, company, ref, flight no…"
                style={{ ...inpStyle, minWidth: 280 }}
              />
              <Sel value={airline} onChange={e => { setAirline(e.target.value); setPage(1) }} options={airlineOptions} />
              <Sel value={type} onChange={e => { setType(e.target.value); setPage(1) }} options={TYPES} />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inpStyle} />
              <span style={{ fontSize: 11, color: '#64748b' }}>to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inpStyle} />
              <button onClick={() => { setAirline(airlineFilterLabel); setType('All Types'); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#475569' }}>
                <X size={12} /> Reset
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>Showing {filtered.length} of {data.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {[
                      { label: 'Date & Time', col: 'dateTime' },
                      { label: 'Passenger Name', col: null },
                      { label: 'PNR', col: null },
                      { label: 'Party', col: 'party' },
                      { label: 'Route', col: null },
                      { label: 'Travel Date', col: null },
                      { label: 'Airline', col: null },
                      { label: 'Amount', col: 'amount' },
                      { label: 'Invoice No.', col: null },
                      { label: 'Invoice Type', col: null },
                      { label: 'Actions', col: null },
                    ].map(({ label, col }) => (
                      <th key={label} onClick={() => col && toggleSort(col)} style={{ padding: '10px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap', cursor: col ? 'pointer' : 'default', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {label}{col && <ArrowUp size={10} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={td}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{formatDateTime(r.created_at || r.date)}</div>
                        <div style={{ fontSize: 10, color: '#1a56db', marginTop: 2, textTransform: 'capitalize' }}>{r.service || r.type}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.passengerName || (r.passengers?.[0] || '')}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{r.paxCount || r.passengers?.length || 0} pax</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>{r.pnr}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.party}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{r.gst || 'No GST'}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{r.route?.from} → {r.route?.to}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 11, color: '#1e293b' }}>{r.travelDate}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{r.depTime} → {r.arrTime}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{r.airline}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{r.flightNo}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fmt(r.amount)}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Fare: {fmt(r.fare)}</div>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 11, fontWeight: r.invoiceNumber ? 700 : 500, fontFamily: r.invoiceNumber ? 'monospace' : 'inherit', color: r.invoiceNumber ? '#1e293b' : '#94a3b8' }}>
                          {r.invoiceNumber || 'Not Generated'}
                        </span>
                      </td>
                      <td style={td}>
                        <select
                          value={invoiceTypeByBooking[r.id] || ''}
                          onChange={e => handleInvoiceTypeChange(r.id, e.target.value)}
                          style={{ ...inpStyle, cursor: 'pointer', width: 84, padding: '4px 6px', fontSize: 10 }}
                        >
                          <option value="" disabled>Select Invoice Type</option>
                          {INVOICE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <button title="View" style={iconBtn('#eff6ff', '#1a56db')} onClick={() => openView(r)}><Eye size={13} /></button>{' '}
                        <button title="Edit" style={iconBtn('#f0fdf4', '#15803d')} onClick={() => openEdit(r)}><Pencil size={13} /></button>{' '}
                        <button title={generatingId === r.id ? 'Generating…' : 'Generate'} style={{ ...iconBtn('#f8fafc', '#475569'), opacity: generatingId === r.id ? 0.5 : 1 }} onClick={() => generateInvoice(r)} disabled={generatingId === r.id}>
                          <Download size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {slice.length === 0 && <EmptyState colSpan={11} message={emptyMessage} />}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <div key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: p === page ? '#1a56db' : '#fff', color: p === page ? '#fff' : '#475569', border: p === page ? 'none' : '1.5px solid #e2e8f0' }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

const td = { padding: '10px 12px', fontSize: 11, verticalAlign: 'middle', color: '#1e293b' }
const inpStyle = { padding: '5px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 11, outline: 'none', background: '#fff' }
const iconBtn = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, padding: 0, border: `1px solid ${color}22`, borderRadius: 6, cursor: 'pointer', background: bg, color, transition: 'opacity .15s' })

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inpStyle, cursor: 'pointer' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

function TopCard({ icon: Icon, label, value, warn, orange }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: orange ? '#fff8e1' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={orange ? '#e8400a' : '#1a56db'} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: orange ? '#e8400a' : '#1e293b', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}
