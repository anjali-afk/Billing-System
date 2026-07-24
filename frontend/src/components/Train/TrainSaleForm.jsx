import { useState, Fragment } from 'react'
import styles from '../Flight/FlightSaleForm.module.css'
import tstyles from './TrainSaleForm.module.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/* ── constants (same source lists as FlightSaleForm where the concept overlaps) ── */
const COMPANIES     = ['Holiday Chacha PVT LTD', 'HPD Tourism LLC']
const SERVICES      = ['Train', 'International Train']
const CLASSES       = ['1A', '2A', '3A', 'SL', 'CC']
const PASSENGER_TYPES = ['Adult', 'Child', 'Senior', 'Infant']
const STATUS_OPTIONS  = [
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'RAC/waiting', label: 'RAC / WL' },
]
const TEAM_MEMBERS  = ['Rajesh Kumar', 'Priya Sharma', 'Amit Verma', 'Neha Singh']

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const EMPTY_JOURNEY = {
  pnr: '', travelDate: '', classType: '', from: '', to: '', trainNumber: '',
}

const EMPTY_PAX = {
  passengerName: '', passengerType: 'Adult', cellNo: '', seatNo: '',
  status: 'Confirmed', basic: '', fare: '', irctc: '', gateway: '', other: '',
  markup: '', total: '0.00', dob: '', dom: '', email: '',
}

function calcTotal(p) {
  const n = v => parseFloat(v) || 0
  return (n(p.basic) + n(p.fare) + n(p.irctc) + n(p.gateway) + n(p.other) + n(p.markup)).toFixed(2)
}

export default function TrainSaleForm({ onBack, onSaved }) {
  /* ── header fields (entered once) ── */
  const [ref, setRef] = useState('')
  const [company, setCompany] = useState('')
  const [service, setService] = useState('')
  const [partyName, setPartyName] = useState('')
  const [gstin, setGstin] = useState('')
  const [placeSupply, setPlaceSupply] = useState('')
  const [dueDate, setDueDate] = useState('')

  /* ── journey — booking-level, single train, shared by every passenger ── */
  const [journey, setJourney] = useState({ ...EMPTY_JOURNEY })
  const updateJourney = (field, val) => setJourney(prev => ({ ...prev, [field]: val }))

  /* ── footer fields ── */
  const [supplier, setSupplier] = useState('')
  const [teamMember, setTeamMember] = useState('')

  /* ── passenger rows + details popup (DOB / DOM / Email) ── */
  const [passengers, setPassengers] = useState([{ ...EMPTY_PAX }])
  const [detailsPaxIndex, setDetailsPaxIndex] = useState(null)

  const updatePax = (i, field, val) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : {
      ...p, [field]: val,
      total: calcTotal({ ...p, [field]: val }),
    }))

  const addPax = () => setPassengers(prev => [...prev, { ...EMPTY_PAX }])
  const removePaxAt = (i) => setPassengers(prev => prev.length > 1 ? prev.filter((_, j) => j !== i) : prev)

  const savePaxDetails = (i, details) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : { ...p, ...details }))

  /* ── collapsible section state ── */
  const [openSections, setOpenSections] = useState({ invoice: true, journey: true, passengers: true })
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  /* ── errors / save state ── */
  const [errors, setErrors] = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const gstValid = !gstin || GST_REGEX.test(gstin)

  const resetForm = () => {
    setRef(''); setCompany(''); setService(''); setPartyName('')
    setGstin(''); setPlaceSupply(''); setDueDate('')
    setJourney({ ...EMPTY_JOURNEY })
    setSupplier(''); setTeamMember('')
    setPassengers([{ ...EMPTY_PAX }])
    setErrors([])
  }

  const handleSave = async () => {
    const e = []
    const headerInvalid = !company || !partyName || !service || (gstin && !gstValid)
    if (!company) e.push('Company is required')
    if (!partyName) e.push('Party Name is required')
    if (!service) e.push('Service is required')
    if (!supplier) e.push('Supplier is required')
    if (gstin && !gstValid) e.push('GSTIN format is invalid (must be 15 characters)')

    const journeyInvalid = !journey.pnr || !journey.travelDate || !journey.classType
    if (!journey.pnr) e.push('PNR Number is required')
    if (!journey.travelDate) e.push('Travel Date is required')
    if (!journey.classType) e.push('Class is required')

    if (passengers.every(p => !p.passengerName)) e.push('At least 1 Passenger Name required')
    passengers.forEach((p, i) => {
      if (p.passengerName && !p.passengerType) e.push(`Passenger ${i + 1}: Passenger Type is required`)
      if (p.passengerName && !p.status) e.push(`Passenger ${i + 1}: Status is required`)
    })

    if (e.length) {
      setErrors(e)
      if (headerInvalid || journeyInvalid) setOpenSections(prev => ({ ...prev, invoice: true, journey: true }))
      return
    }
    setErrors([])

    const payload = {
      ref, company, service, partyName, gstin, placeSupply, dueDate,
      journey,
      passengers: passengers.map((p, i) => ({
        ...p,
        ticketNo: journey.pnr ? `${journey.pnr}-${i + 1}` : '',
      })),
      supplier, teamMember,
      grandTotal,
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/trains/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save invoice')

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onSaved?.()
        resetForm()
      }, 2000)
    } catch (err) {
      setErrors([`Save failed: ${err.message}`])
    } finally {
      setSaving(false)
    }
  }

  /* ── grand total ── */
  const grandTotal = passengers.reduce((s, p) => s + (parseFloat(p.total) || 0), 0).toFixed(2)

  /* ── collapsed-state preview text ── */
  const invoiceSubtitle = [company, service, partyName].filter(Boolean).join(' • ') || 'Not filled yet'
  const journeySubtitle = journey.pnr
    ? `PNR ${journey.pnr}${journey.from && journey.to ? ` • ${journey.from} → ${journey.to}` : ''}`
    : 'Not filled yet'
  const passengersSubtitle = passengers.length
    ? `${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`
    : 'Not filled yet'

  return (
    <div className={styles.page}>

      {/* ══ NAVBAR ══════════════════════════════════════ */}
      <header className={styles.navbar}>
        <div className={styles.navLogo}>
          <span>🚆</span> Train Sale
        </div>
        <div className={styles.navCenter} />
        <div className={styles.navRight}>
          {onBack && <button className={styles.btnGhost} onClick={onBack}>← Back</button>}
        </div>
      </header>

      <div className={styles.body}>

        {/* ══ FORM CARD ════════════════════════════════════ */}
        <div className={styles.formCard}>

          {errors.length > 0 && (
            <div className={styles.errBanner}>
              {errors.map((e, i) => <span key={i}>⚠ {e}</span>)}
            </div>
          )}
          {saved && <div className={styles.successBanner}>Data saved successfully.</div>}

          {/* ── INVOICE DETAILS ── */}
          <Accordion icon="🧾" title="Invoice Details" subtitle={invoiceSubtitle}
                     open={openSections.invoice} onToggle={() => toggleSection('invoice')}
                     bodyClassName={styles.invoiceAccordionBody}>
          <div className={[styles.compactRow, styles.invoiceGrid].join(' ')}>
            <FG label="Ref">
              <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Deal ref" />
            </FG>
            <FG label="Company *">
              <select value={company} onChange={e => setCompany(e.target.value)}>
                <option value="">Select</option>
                {COMPANIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FG>
            <FG label="Service *">
              <select value={service} onChange={e => setService(e.target.value)}>
                <option value="">Select</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FG>
            <FG label="Party Name *">
              <input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="Party / Client" />
            </FG>
            <FG label="GSTIN">
              <input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="15-char GSTIN" maxLength={15}
                     className={gstin ? (gstValid ? styles.ok : styles.err) : ''} />
              {gstin && !gstValid && <span className={styles.hintErr}>Invalid GST format</span>}
            </FG>
            <FG label="Place of Supply">
              <input value={placeSupply} onChange={e => setPlaceSupply(e.target.value)} placeholder="State" />
            </FG>
            <FG label="Due Date">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </FG>
          </div>
          </Accordion>

          {/* ── JOURNEY DETAILS — booking-level, one train shared by every passenger ── */}
          <Accordion icon="🚆" title="Journey Details" subtitle={journeySubtitle}
                     open={openSections.journey} onToggle={() => toggleSection('journey')}
                     bodyClassName={styles.invoiceAccordionBody}>
          <div className={tstyles.journeyTable}>
            <div className={styles.paxTableHead}>PNR Number</div>
            <div className={styles.paxTableHead}>Travel Date</div>
            <div className={styles.paxTableHead}>Class</div>
            <div className={styles.paxTableHead}>From</div>
            <div className={styles.paxTableHead}>To</div>
            <div className={styles.paxTableHead}>Train No</div>

            <div className={styles.paxTableCell}>
              <input value={journey.pnr} onChange={e => updateJourney('pnr', e.target.value.replace(/\D/g, ''))} placeholder="PNR" />
            </div>
            <div className={styles.paxTableCell}>
              <input type="date" value={journey.travelDate} onChange={e => updateJourney('travelDate', e.target.value)} />
            </div>
            <div className={styles.paxTableCell}>
              <select value={journey.classType} onChange={e => updateJourney('classType', e.target.value)}>
                <option value="">Select</option>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.paxTableCell}>
              <input value={journey.from} onChange={e => updateJourney('from', e.target.value.toUpperCase())} placeholder="From station" />
            </div>
            <div className={styles.paxTableCell}>
              <input value={journey.to} onChange={e => updateJourney('to', e.target.value.toUpperCase())} placeholder="To station" />
            </div>
            <div className={styles.paxTableCell}>
              <input value={journey.trainNumber} onChange={e => updateJourney('trainNumber', e.target.value.replace(/\D/g, ''))} placeholder="Train No" />
            </div>
          </div>
          </Accordion>

          {/* ── PASSENGER MANAGEMENT ── */}
          <Accordion icon="👥" title="Passenger Management" subtitle={passengersSubtitle}
                     open={openSections.passengers} onToggle={() => toggleSection('passengers')}
                     headerAction={
                       <div className={styles.paxBtns}>
                         <span className={styles.paxCount}>{passengers.length} pax</span>
                         <button className={styles.circleBtn} onClick={addPax} title="Add passenger">＋</button>
                       </div>
                     }>
          <div className={tstyles.trainPaxTable}>
            <div className={styles.paxTableHead}>Passenger</div>
            <div className={styles.paxTableHead}>Cell No.</div>
            <div className={styles.paxTableHead}>Ticket No.</div>
            <div className={styles.paxTableHead}>Seat No.</div>
            <div className={styles.paxTableHead}>Type</div>
            <div className={styles.paxTableHead}>Status</div>
            <div className={styles.paxTableHead}>Basic</div>
            <div className={styles.paxTableHead}>Fare</div>
            <div className={styles.paxTableHead}>IRCTC</div>
            <div className={styles.paxTableHead}>Gateway</div>
            <div className={styles.paxTableHead}>Other</div>
            <div className={styles.paxTableHead}>Markup</div>
            <div className={styles.paxTableHead}>Total</div>
            <div className={styles.paxTableHead}>Actions</div>

            {passengers.map((p, pi) => (
              <Fragment key={pi}>
                <div className={styles.paxTableCell}>
                  <input value={p.passengerName} onChange={e => updatePax(pi, 'passengerName', e.target.value.toUpperCase())} placeholder="Full name" />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={p.cellNo} onChange={e => updatePax(pi, 'cellNo', e.target.value.replace(/\D/g, ''))} placeholder="Phone" maxLength={12} />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={journey.pnr ? `${journey.pnr}-${pi + 1}` : ''} readOnly placeholder="Auto" />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={p.seatNo} onChange={e => updatePax(pi, 'seatNo', e.target.value)} placeholder="Seat" />
                </div>
                <div className={styles.paxTableCell}>
                  <select value={p.passengerType} onChange={e => updatePax(pi, 'passengerType', e.target.value)}>
                    {PASSENGER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.paxTableCell}>
                  <select value={p.status} onChange={e => updatePax(pi, 'status', e.target.value)}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.basic} onChange={e => updatePax(pi, 'basic', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.fare} onChange={e => updatePax(pi, 'fare', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.irctc} onChange={e => updatePax(pi, 'irctc', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.gateway} onChange={e => updatePax(pi, 'gateway', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.other} onChange={e => updatePax(pi, 'other', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="number" value={p.markup} onChange={e => updatePax(pi, 'markup', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.paxTableCell}>
                  <span className={styles.paxRowTotal}>{p.total}</span>
                </div>
                <div className={[styles.paxTableCell, tstyles.trainPaxActions].join(' ')}>
                  <button className={styles.circleBtn} title="DOB / DOM / Email" onClick={() => setDetailsPaxIndex(pi)}>ℹ</button>
                  {passengers.length > 1 && (
                    <button className={styles.removePaxBtn} onClick={() => removePaxAt(pi)}>✕</button>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          </Accordion>

          {detailsPaxIndex !== null && (
            <PassengerDetailsModal
              passenger={passengers[detailsPaxIndex]}
              onSave={details => { savePaxDetails(detailsPaxIndex, details); setDetailsPaxIndex(null) }}
              onClose={() => setDetailsPaxIndex(null)}
            />
          )}

          {/* ── ADDITIONAL DETAILS & SUMMARY (75%)  +  GRAND TOTAL (25%) ── */}
          <div className={styles.bottomGrid}>

            <div className={styles.bottomCard}>
              <div className={styles.accordionHead}>
                <span className={styles.accordionTitle}>📋 Additional Details &amp; Summary</span>
              </div>
              <div className={styles.accordionBody}>
                <div className={styles.compactRow}>
                  <FG label="Supplier *" width={180}>
                    <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier" />
                  </FG>
                  <FG label="Team Member" width={150}>
                    <select value={teamMember} onChange={e => setTeamMember(e.target.value)}>
                      <option value="">Select</option>
                      {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </FG>
                </div>
              </div>
            </div>

            <div className={styles.bottomCard}>
              <div className={styles.accordionHead}>
                <span className={styles.accordionTitle}>Grand Total</span>
              </div>
              <div className={styles.accordionBody}>
                <span className={styles.gtVal}>
                  ₹ {parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : '💾 SAVE ALL DATA (ENTER)'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}

/* ── Collapsible Section (same as FlightSaleForm's, duplicated locally
     so this file has no dependency on FlightSaleForm.jsx internals) ── */
function Accordion({ icon, title, subtitle, open, onToggle, headerAction, bodyClassName, children }) {
  return (
    <>
      <div
        className={[styles.accordionHead, open ? styles.accordionHeadOpen : ''].join(' ')}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
      >
        <span className={styles.accordionTitle}>{icon} {title}</span>
        <span className={styles.accordionRight}>
          {!open && subtitle && <span className={styles.accordionSubtitle}>{subtitle}</span>}
          {headerAction && <span onClick={e => e.stopPropagation()}>{headerAction}</span>}
          <span className={styles.accordionChevron}>{open ? '▾' : '▸'}</span>
        </span>
      </div>
      {open && <div className={[styles.accordionBody, bodyClassName || ''].join(' ')}>{children}</div>}
    </>
  )
}

/* ── Passenger Date of Birth / Marriage / Email popup ── */
function PassengerDetailsModal({ passenger, onSave, onClose }) {
  const [dob, setDob] = useState(passenger.dob)
  const [dom, setDom] = useState(passenger.dom)
  const [email, setEmail] = useState(passenger.email)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span>
            Passenger Details
            {passenger.passengerName && <em>— {passenger.passengerName}</em>}
          </span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>Date of Birth</div>
            <input type="date" className={styles.overrideInput} value={dob} onChange={e => setDob(e.target.value)} />
          </div>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>Date of Marriage</div>
            <input type="date" className={styles.overrideInput} value={dom} onChange={e => setDom(e.target.value)} />
          </div>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>Email</div>
            <input type="email" className={styles.overrideInput} value={email}
                   onChange={e => setEmail(e.target.value)} placeholder="Enter Email" />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.manageBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={() => onSave({ dob, dom, email })}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Field Group (same as FlightSaleForm's) ─── */
function FG({ label, children, grow, width }) {
  const w = typeof width === 'number' ? `${width}px` : width
  const style = grow
    ? { flex: (typeof grow === 'number' || typeof grow === 'string') ? grow : 1, ...(width ? { minWidth: w } : {}) }
    : width ? { minWidth: w, maxWidth: w } : undefined
  return (
    <div className={styles.fg} style={style}>
      <label className={styles.fgLabel}>{label}</label>
      {children}
    </div>
  )
}
