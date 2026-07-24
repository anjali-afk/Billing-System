import { useState, Fragment } from 'react'
import styles from './TrainSaleForm.module.css'

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
  markup: '', total: '0.00',
  sameParty: true, partyOverride: '', gstinOverride: '', placeSupplyOverride: '',
}

function calcTotal(p) {
  const n = v => parseFloat(v) || 0
  return (n(p.basic) + n(p.fare) + n(p.irctc) + n(p.gateway) + n(p.other) + n(p.markup)).toFixed(2)
}

/* Passenger rows from an existing BookingDetail record (Admin edit flow).
   Same EMPTY_PAX shape as the blank-row path — the form never knows
   whether a row is new or came from a saved record. */
function paxRowsFromInitialData(initialData) {
  return (initialData.passengers || []).map(p => {
    const base = { ...EMPTY_PAX, ...p }
    return { ...base, total: calcTotal(base) }
  })
}

export default function TrainSaleForm({ initialData, bookingId, onBack, onSaved }) {
  const isEdit = Boolean(bookingId)

  /* ── header fields (entered once) ── */
  const [ref, setRef] = useState(initialData?.ref ?? '')
  const [company, setCompany] = useState(initialData?.company ?? '')
  const [service, setService] = useState(initialData?.service ?? '')
  const [partyName, setPartyName] = useState(initialData?.partyName ?? '')
  const [gstin, setGstin] = useState(initialData?.gstin ?? '')
  const [placeSupply, setPlaceSupply] = useState(initialData?.placeSupply ?? '')
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '')

  /* ── journey — booking-level, single train, shared by every passenger ── */
  const [journey, setJourney] = useState({ ...EMPTY_JOURNEY, ...(initialData?.journey || {}) })
  const updateJourney = (field, val) => setJourney(prev => ({ ...prev, [field]: val }))

  /* ── footer fields ── */
  const [supplier, setSupplier] = useState(initialData?.supplier ?? '')
  const [teamMember, setTeamMember] = useState(initialData?.teamMember ?? '')

  /* ── passenger rows + per-passenger Party/GSTIN/Place of Supply override popup ── */
  const [passengers, setPassengers] = useState(() =>
    initialData ? paxRowsFromInitialData(initialData) : [{ ...EMPTY_PAX }]
  )
  const [overridePaxIndex, setOverridePaxIndex] = useState(null)

  const updatePax = (i, field, val) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : {
      ...p, [field]: val,
      total: calcTotal({ ...p, [field]: val }),
    }))

  const addPax = () => setPassengers(prev => [...prev, { ...EMPTY_PAX }])
  const removePaxAt = (i) => setPassengers(prev => prev.length > 1 ? prev.filter((_, j) => j !== i) : prev)

  const savePaxOverride = (i, overrides) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : { ...p, ...overrides }))

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
      if (!p.sameParty && !p.partyOverride) e.push(`Passenger ${i + 1}: enter a Party Name (or re-check "Same Party")`)
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
        effectivePartyName: p.sameParty ? partyName : p.partyOverride,
        effectiveGstin: p.sameParty ? gstin : p.gstinOverride,
        effectivePlaceSupply: p.sameParty ? placeSupply : p.placeSupplyOverride,
      })),
      supplier, teamMember,
      grandTotal,
    }

    setSaving(true)
    try {
      const url = isEdit ? `${API_BASE}/trains/${bookingId}` : `${API_BASE}/trains/save`
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save invoice')

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        if (isEdit) {
          onSaved?.()
        } else {
          resetForm()
        }
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
    <div className={styles.trainPage}>

      {/* ══ NAVBAR ══════════════════════════════════════ */}
      <header className={styles.trainNavbar}>
        <div className={styles.trainNavLogo}>
          <span>🚆</span> Train Sale
        </div>
        <div className={styles.trainNavCenter} />
        <div className={styles.trainNavRight}>
          {onBack && <button className={styles.trainBtnGhost} onClick={onBack}>← Back</button>}
        </div>
      </header>

      <div className={styles.trainBody}>

        {/* ══ FORM CARD ════════════════════════════════════ */}
        <div className={styles.trainFormCard}>

          {errors.length > 0 && (
            <div className={styles.trainErrBanner}>
              {errors.map((e, i) => <span key={i}>⚠ {e}</span>)}
            </div>
          )}
          {saved && <div className={styles.trainSuccessBanner}>Data saved successfully.</div>}

          {/* ── INVOICE DETAILS ── */}
          <Accordion icon="🧾" title="Invoice Details" subtitle={invoiceSubtitle}
                     open={openSections.invoice} onToggle={() => toggleSection('invoice')}
                     bodyClassName={styles.trainInvoiceAccordionBody}>
          <div className={styles.trainInvoiceGrid}>
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
                     className={gstin ? (gstValid ? styles.trainOk : styles.trainErr) : ''} />
              {gstin && !gstValid && <span className={styles.trainHintErr}>Invalid GST format</span>}
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
                     bodyClassName={styles.trainInvoiceAccordionBody}>
          <div className={styles.trainJourneyTable}>
            <div className={styles.trainPaxTableHead}>PNR Number</div>
            <div className={styles.trainPaxTableHead}>Travel Date</div>
            <div className={styles.trainPaxTableHead}>Class</div>
            <div className={styles.trainPaxTableHead}>From</div>
            <div className={styles.trainPaxTableHead}>To</div>
            <div className={styles.trainPaxTableHead}>Train No</div>

            <div className={styles.trainPaxTableCell}>
              <input value={journey.pnr} onChange={e => updateJourney('pnr', e.target.value.replace(/\D/g, ''))} placeholder="PNR" />
            </div>
            <div className={styles.trainPaxTableCell}>
              <input type="date" value={journey.travelDate} onChange={e => updateJourney('travelDate', e.target.value)} />
            </div>
            <div className={styles.trainPaxTableCell}>
              <select value={journey.classType} onChange={e => updateJourney('classType', e.target.value)}>
                <option value="">Select</option>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.trainPaxTableCell}>
              <input value={journey.from} onChange={e => updateJourney('from', e.target.value.toUpperCase())} placeholder="From station" />
            </div>
            <div className={styles.trainPaxTableCell}>
              <input value={journey.to} onChange={e => updateJourney('to', e.target.value.toUpperCase())} placeholder="To station" />
            </div>
            <div className={styles.trainPaxTableCell}>
              <input value={journey.trainNumber} onChange={e => updateJourney('trainNumber', e.target.value.replace(/\D/g, ''))} placeholder="Train No" />
            </div>
          </div>
          </Accordion>

          {/* ── PASSENGER MANAGEMENT ── */}
          <Accordion icon="👥" title="Passenger Management" subtitle={passengersSubtitle}
                     open={openSections.passengers} onToggle={() => toggleSection('passengers')}
                     headerAction={
                       <div className={styles.trainPaxBtns}>
                         <span className={styles.trainPaxCount}>{passengers.length} pax</span>
                         <button className={styles.trainCircleBtn} onClick={addPax} title="Add passenger">＋</button>
                       </div>
                     }>
          <div className={styles.trainPassengerTable}>
            <div className={styles.trainPaxTableHead}>Passenger</div>
            <div className={styles.trainPaxTableHead}>Cell No.</div>
            <div className={styles.trainPaxTableHead}>Ticket No.</div>
            <div className={styles.trainPaxTableHead}>Seat No.</div>
            <div className={styles.trainPaxTableHead}>Type</div>
            <div className={styles.trainPaxTableHead}>Status</div>
            <div className={styles.trainPaxTableHead}>Basic</div>
            <div className={styles.trainPaxTableHead}>Fare</div>
            <div className={styles.trainPaxTableHead}>IRCTC</div>
            <div className={styles.trainPaxTableHead}>Gateway</div>
            <div className={styles.trainPaxTableHead}>Other</div>
            <div className={styles.trainPaxTableHead}>Markup</div>
            <div className={styles.trainPaxTableHead}>Total</div>
            <div className={styles.trainPaxTableHead}>Same Party</div>

            {passengers.map((p, pi) => (
              <Fragment key={pi}>
                <div className={styles.trainPaxTableCell}>
                  <input value={p.passengerName} onChange={e => updatePax(pi, 'passengerName', e.target.value.toUpperCase())} placeholder="Full name" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input value={p.cellNo} onChange={e => updatePax(pi, 'cellNo', e.target.value.replace(/\D/g, ''))} placeholder="Phone" maxLength={12} />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input value={journey.pnr ? `${journey.pnr}-${pi + 1}` : ''} readOnly placeholder="Auto" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input value={p.seatNo} onChange={e => updatePax(pi, 'seatNo', e.target.value)} placeholder="Seat" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <select value={p.passengerType} onChange={e => updatePax(pi, 'passengerType', e.target.value)}>
                    {PASSENGER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.trainPaxTableCell}>
                  <select value={p.status} onChange={e => updatePax(pi, 'status', e.target.value)}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.basic} onChange={e => updatePax(pi, 'basic', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.fare} onChange={e => updatePax(pi, 'fare', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.irctc} onChange={e => updatePax(pi, 'irctc', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.gateway} onChange={e => updatePax(pi, 'gateway', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.other} onChange={e => updatePax(pi, 'other', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <input type="number" value={p.markup} onChange={e => updatePax(pi, 'markup', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.trainPaxTableCell}>
                  <span className={styles.trainPaxRowTotal}>{p.total}</span>
                </div>
                <div className={[styles.trainPaxTableCell, styles.trainPaxTablePartyCell].join(' ')}>
                  <label className={styles.trainCheckboxLbl}>
                    <input
                      type="checkbox"
                      checked={p.sameParty}
                      onChange={e => {
                        const checked = e.target.checked
                        updatePax(pi, 'sameParty', checked)
                        if (!checked) setOverridePaxIndex(pi)
                      }}
                    />
                  </label>
                  {passengers.length > 1 && (
                    <button className={styles.trainRemovePaxBtn} onClick={() => removePaxAt(pi)}>✕</button>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          </Accordion>

          {overridePaxIndex !== null && (
            <PartyOverrideModal
              passenger={passengers[overridePaxIndex]}
              onSave={overrides => {
                savePaxOverride(overridePaxIndex, overrides)
                setOverridePaxIndex(null)
              }}
              onClose={() => {
                updatePax(overridePaxIndex, 'sameParty', true)
                setOverridePaxIndex(null)
              }}
            />
          )}

          {/* ── ADDITIONAL DETAILS & SUMMARY (75%)  +  GRAND TOTAL (25%) ── */}
          <div className={styles.trainBottomGrid}>

            <div className={styles.trainBottomCard}>
              <div className={styles.trainAccordionHead}>
                <span className={styles.trainAccordionTitle}>📋 Additional Details &amp; Summary</span>
              </div>
              <div className={styles.trainAccordionBody}>
                <div className={styles.trainCompactRow}>
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

            <div className={styles.trainBottomCard}>
              <div className={styles.trainAccordionHead}>
                <span className={styles.trainAccordionTitle}>Grand Total</span>
              </div>
              <div className={styles.trainAccordionBody}>
                <span className={styles.trainGtVal}>
                  ₹ {parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button className={styles.trainSaveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : isEdit ? '💾 UPDATE BOOKING (ENTER)' : '💾 SAVE ALL DATA (ENTER)'}
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
        className={[styles.trainAccordionHead, open ? styles.trainAccordionHeadOpen : ''].join(' ')}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}
      >
        <span className={styles.trainAccordionTitle}>{icon} {title}</span>
        <span className={styles.trainAccordionRight}>
          {!open && subtitle && <span className={styles.trainAccordionSubtitle}>{subtitle}</span>}
          {headerAction && <span onClick={e => e.stopPropagation()}>{headerAction}</span>}
          <span className={styles.trainAccordionChevron}>{open ? '▾' : '▸'}</span>
        </span>
      </div>
      {open && <div className={[styles.trainAccordionBody, bodyClassName || ''].join(' ')}>{children}</div>}
    </>
  )
}

/* ── Passenger-specific Party/GSTIN/Place of Supply override popup
     (same purpose as FlightSaleForm's PartyOverrideModal) ── */
function PartyOverrideModal({ passenger, onSave, onClose }) {
  const [partyOverride, setPartyOverride] = useState(passenger.partyOverride)
  const [gstinOverride, setGstinOverride] = useState(passenger.gstinOverride)
  const [placeSupplyOverride, setPlaceSupplyOverride] = useState(passenger.placeSupplyOverride)

  return (
    <div className={styles.trainModalOverlay} onClick={onClose}>
      <div className={styles.trainModalCard} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className={styles.trainModalHeader}>
          <span>
            Override Party Details
            {passenger.passengerName && <em>— {passenger.passengerName}</em>}
          </span>
          <button className={styles.trainModalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.trainModalBody}>
          <div className={styles.trainOverrideModalField}>
            <div className={styles.trainPaxSubheading}>Party Name *</div>
            <input className={styles.trainOverrideInput} value={partyOverride}
                   onChange={e => setPartyOverride(e.target.value)}
                   placeholder="Party / Client" autoFocus />
          </div>
          <div className={styles.trainOverrideModalField}>
            <div className={styles.trainPaxSubheading}>GSTIN</div>
            <input className={styles.trainOverrideInput} value={gstinOverride}
                   onChange={e => setGstinOverride(e.target.value.toUpperCase())}
                   placeholder="15-char GSTIN" maxLength={15} />
          </div>
          <div className={styles.trainOverrideModalField}>
            <div className={styles.trainPaxSubheading}>Place of Supply</div>
            <input className={styles.trainOverrideInput} value={placeSupplyOverride}
                   onChange={e => setPlaceSupplyOverride(e.target.value)}
                   placeholder="State" />
          </div>
        </div>
        <div className={styles.trainModalFooter}>
          <button className={styles.trainManageBtn} onClick={onClose}>Cancel</button>
          <button className={styles.trainSaveBtn}
                  onClick={() => onSave({ partyOverride, gstinOverride, placeSupplyOverride })}>
            Save
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
    <div className={styles.trainFG} style={style}>
      <label className={styles.trainFGLabel}>{label}</label>
      {children}
    </div>
  )
}
