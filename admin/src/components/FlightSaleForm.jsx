import { useState, useRef, useEffect, Fragment } from 'react'
import styles from './FlightSaleForm.module.css'
import { getMockScanResult, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../mock/mockScan.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/* ── constants ── */
const COMPANIES    = ['Holiday Chacha PVT LTD', 'HPD Tourism LLC']
const SERVICES     = ['Domestic Flight', 'International Flight']
const INV_TYPES    = ['Normal', 'Reissue', 'Emd', 'Void']
const TRIP_TYPES   = ['One Way', 'Round Trip', 'Multi Trip']
const CRS_NAMES    = ['Gal', 'Amadeus', 'NDC', 'Online LCC']
const CLASSES      = ['Economy', 'Premium Economy', 'Business', 'First']
const CURRENCIES   = ['INR', 'USD', 'AED', 'THB', 'GBP', 'EUR', 'CNY', 'SGD']
const PAID_VIA     = ['Bank', 'Credit Card']
const TEAM_MEMBERS = ['Rajesh Kumar', 'Priya Sharma', 'Amit Verma', 'Neha Singh']
const SUPPLIERS    = ['AIR INDIA', 'INDIGO', 'SPICEJET', 'VISTARA', 'AKASA', 'EMIRATES', 'QATAR AIRWAYS', 'AIR ARABIA']

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

/* One flight segment — a booking-level concern shared by every
   passenger on the invoice, not owned by any single passenger. */
const EMPTY_SEGMENT = {
  airline: '', flightNo: '', airlinePnr: '', crsPnr: '', crsName: '',
  travelClass: '', travelDate: '', from: '', to: '', depTime: '', arrTime: '',
  tripType: '', fareBasis: '',
}

/* Passenger fields. Ticket No. is passenger-specific. Party name/GSTIN/
   Place of Supply come from Invoice Details unless overridden per
   passenger via the popup. */
const EMPTY_PAX = {
  passengerName: '', cellNo: '', ticketNo: '',
  sameParty: true, partyOverride: '', gstinOverride: '', placeSupplyOverride: '',
  currency: 'INR', value: '', basicAm: '', k3: '', yq: '', yr: '',
  otherChg: '', markup: '', discount: '', total: '0.00',
}

function calcTotal(p) {
  const n = v => parseFloat(v) || 0
  return (n(p.basicAm) + n(p.k3) + n(p.yq) + n(p.yr) +
          n(p.otherChg) + n(p.markup) - n(p.discount)).toFixed(2)
}

/* One flight segment's worth of fields from a single scanned leg.
   Every leg present on the ticket (outbound, return, connecting,
   multi-city) is parsed the same way — nothing stops after leg 1. */
function segmentFromScan(leg) {
  return {
    ...EMPTY_SEGMENT,
    airline: leg.airline || '',
    flightNo: leg.flightNo || '',
    airlinePnr: leg.airlinePnr || '',
    crsPnr: leg.crsPnr || '',
    crsName: leg.crsName || '',
    travelClass: leg.travelClass || '',
    travelDate: leg.travelDate || '',
    from: leg.from || '',
    to: leg.to || '',
    depTime: leg.depTime || '',
    arrTime: leg.arrTime || '',
    tripType: leg.tripType || '',
    fareBasis: leg.fareBasis || '',
  }
}

/* Booking-level Flight Segment rows from a mock-OCR scan result. A
   ticket can carry any number of legs (One Way = 1, Round Trip = 2,
   Multi-City/connecting = N) — every leg becomes its own row, shared
   by every passenger on the invoice. */
function segmentsFromScan(scan) {
  const legs = scan.legs || []
  return legs.length ? legs.map(segmentFromScan) : [{ ...EMPTY_SEGMENT }]
}

/* Passenger-specific rows from a mock-OCR scan result. Passenger-level
   fare fields are the sum across every scanned leg, not just the first. */
function paxRowsFromScan(scan) {
  const legs = scan.legs || []
  const sumLegs = field => legs.reduce((t, leg) => t + (Number(leg[field]) || 0), 0)
  return scan.passengers.map(sp => {
    const base = {
      ...EMPTY_PAX,
      passengerName: sp.passengerName || '',
      cellNo: sp.cellNo || '',
      ticketNo: sp.ticketNo || '',
      basicAm: String(sumLegs('basicAm')),
      k3: String(sumLegs('k3')),
      yq: String(sumLegs('yq')),
      yr: String(sumLegs('yr')),
      otherChg: String(sumLegs('otherChg')),
    }
    return { ...base, total: calcTotal(base) }
  })
}

/* Passenger rows from an existing BookingDetail record (Admin edit flow).
   Same EMPTY_PAX shape as the scan/create path — the form never knows
   whether a row came from OCR, a blank row, or a saved record. */
function paxRowsFromInitialData(initialData) {
  return (initialData.passengers || []).map(p => {
    const base = { ...EMPTY_PAX, ...p }
    return { ...base, total: calcTotal(base) }
  })
}

function segmentsFromInitialData(initialData) {
  const segs = initialData.segments || []
  if (!segs.length) return [{ ...EMPTY_SEGMENT }]
  return segs.map(s => {
    const merged = { ...EMPTY_SEGMENT, ...s }
    Object.keys(EMPTY_SEGMENT).forEach(k => { if (merged[k] == null) merged[k] = '' })
    return merged
  })
}

const normName = s => (s || '').trim().toUpperCase()

export default function FlightSaleForm({ initialScan, initialData, bookingId, onBack, onSaved }) {
  const isEdit = Boolean(bookingId)

  /* ── upload state (inline re-scan bar) ── */
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const fileRef = useRef()

  /* ── names present in the last scanned PDF, for match tags ── */
  const [scannedNames, setScannedNames] = useState(() =>
    initialScan ? new Set(initialScan.passengers.map(p => normName(p.passengerName))) : null
  )

  /* ── header fields (entered once) ── */
  const [ref, setRef] = useState(initialData?.ref ?? '')
  const [company, setCompany] = useState(initialData?.company ?? '')
  const [service, setService] = useState(initialData?.service ?? '')
  const [partyName, setPartyName] = useState(initialData?.partyName ?? '')
  const [gstin, setGstin] = useState(initialData?.gstin ?? '')
  const [placeSupply, setPlaceSupply] = useState(initialData?.placeSupply ?? '')
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '')
  const [invoiceType, setInvoiceType] = useState(initialData?.invoiceType ?? 'Normal')

  /* ── footer fields ── */
  const [supplier, setSupplier] = useState(initialData?.supplier ?? '')
  const [remark, setRemark] = useState(initialData?.remark ?? '')
  const [paidVia, setPaidVia] = useState(initialData?.paidVia ?? '')
  const [teamMember, setTeamMember] = useState(initialData?.teamMember ?? '')
  const [club, setClub] = useState(initialData?.club ?? '')

  /* ── passenger rows + popup ── */
  const [passengers, setPassengers] = useState(() =>
    initialData ? paxRowsFromInitialData(initialData)
      : initialScan ? paxRowsFromScan(initialScan)
      : [{ ...EMPTY_PAX }]
  )

  /* ── passenger-specific Party/GSTIN/Place of Supply override popup ── */
  const [overridePaxIndex, setOverridePaxIndex] = useState(null)
  const savePaxOverride = (i, overrides) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : { ...p, ...overrides }))

  /* ── flight segments — booking-level, shared by every passenger ── */
  const [segments, setSegments] = useState(() =>
    initialData ? segmentsFromInitialData(initialData)
      : initialScan ? segmentsFromScan(initialScan)
      : [{ ...EMPTY_SEGMENT }]
  )
  const updateSegment = (si, field, val) =>
    setSegments(prev => prev.map((s, k) => k !== si ? s : { ...s, [field]: val }))
  const addSegment = () => setSegments(prev => [...prev, { ...EMPTY_SEGMENT }])
  const removeSegment = (si) =>
    setSegments(prev => prev.length > 1 ? prev.filter((_, k) => k !== si) : prev)

  /* ── collapsible section state ── */
  const [openSections, setOpenSections] = useState({ invoice: true, segments: true, flight: true })
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    if (initialScan) setSupplier(initialScan.supplier || '')
  }, [initialScan])

  /* ── errors / save state ── */
  const [errors, setErrors] = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const gstValid = !gstin || GST_REGEX.test(gstin)

  /* ── file upload / (re)scan ── */
  const handleFiles = (fileList) => {
    const valid = Array.from(fileList).filter(f =>
      ALLOWED_FILE_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    )
    if (!valid.length) return
    setFiles(prev => [...prev, ...valid])
    setScanning(true)
    setScanDone(false)
    setTimeout(() => {
      setScanning(false)
      setScanDone(true)
      const scan = getMockScanResult()
      setPassengers(paxRowsFromScan(scan))
      setSegments(segmentsFromScan(scan))
      setScannedNames(new Set(scan.passengers.map(p => normName(p.passengerName))))
      setSupplier(scan.supplier || '')
    }, 2000)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  /* ── passenger helpers ── */
  const updatePax = (i, field, val) =>
    setPassengers(prev => prev.map((p, j) => j !== i ? p : {
      ...p, [field]: val,
      total: calcTotal({ ...p, [field]: val })
    }))

  const addPax = () => setPassengers(prev => [...prev, { ...EMPTY_PAX }])
  const removePaxAt = (i) => setPassengers(prev => prev.length > 1 ? prev.filter((_, j) => j !== i) : prev)

  /* ── reset form to its exact first-open state ── */
  const resetForm = () => {
    setFiles([])
    setDragging(false)
    setScanning(false)
    setScanDone(false)
    setScannedNames(initialScan ? new Set(initialScan.passengers.map(p => normName(p.passengerName))) : null)
    if (fileRef.current) fileRef.current.value = ''

    setRef('')
    setCompany('')
    setService('')
    setPartyName('')
    setGstin('')
    setPlaceSupply('')
    setDueDate('')
    setInvoiceType('Normal')
    setSupplier(initialScan ? (initialScan.supplier || '') : '')
    setRemark('')
    setPaidVia('')
    setTeamMember('')
    setClub('')

    setPassengers(initialScan ? paxRowsFromScan(initialScan) : [{ ...EMPTY_PAX }])
    setSegments(initialScan ? segmentsFromScan(initialScan) : [{ ...EMPTY_SEGMENT }])

    setErrors([])
  }

  /* ── save ── */
  const handleSave = async () => {
    const e = []
    const headerInvalid = !company || !partyName || !service || (gstin && !gstValid)
    if (!company) e.push('Company is required')
    if (!partyName) e.push('Party Name is required')
    if (!service) e.push('Service is required')
    if (passengers.every(p => !p.passengerName)) e.push('At least 1 Passenger Name required')
    if (gstin && !gstValid) e.push('GSTIN format is invalid (must be 15 characters)')
    passengers.forEach((p, i) => {
      if (p.ticketNo && p.ticketNo.length !== 13) e.push(`Passenger ${i + 1}: Ticket No. must be 13 digits`)
      if (!p.sameParty && !p.partyOverride) e.push(`Passenger ${i + 1}: enter a Party Name (or re-check "Same Party")`)
    })
    if (e.length) {
      setErrors(e)
      if (headerInvalid) setOpenSections(prev => ({ ...prev, invoice: true }))
      return
    }
    setErrors([])

    const payload = {
      ref, company, service, partyName, gstin, placeSupply, dueDate, invoiceType,
      supplier, remark, paidVia, teamMember, club,
      segments,
      passengers: passengers.map(p => ({
        ...p,
        effectivePartyName: p.sameParty ? partyName : p.partyOverride,
        effectiveGstin: p.sameParty ? gstin : p.gstinOverride,
        effectivePlaceSupply: p.sameParty ? placeSupply : p.placeSupplyOverride,
        matchedInPdf: scannedNames ? scannedNames.has(normName(p.passengerName)) : null,
      })),
      files: files.length ? files.map(f => f.name) : (initialData?.files || []),
      grandTotal,
    }

    setSaving(true)
    try {
      const url = isEdit ? `${API_BASE}/bookings/${bookingId}` : `${API_BASE}/flights/save`
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

  /* ── collapsed-state preview text, so context isn't lost when closed ── */
  const invoiceSubtitle = [company, service, partyName].filter(Boolean).join(' • ') || 'Not filled yet'
  const segmentSubtitle = segments.length
    ? `${segments.length} segment${segments.length > 1 ? 's' : ''}`
    : 'Not filled yet'
  const flightSubtitle = passengers.length
    ? `${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`
    : 'Not filled yet'

  return (
    <div className={styles.page}>

      {/* ══ NAVBAR ══════════════════════════════════════ */}
      <header className={styles.navbar}>
        <div className={styles.navLogo}>
          <span>✈️</span> Flight Sale
        </div>
        <div className={styles.navCenter}>
          {scanDone && <span className={styles.scanBadge}>✅ {files.length} file{files.length > 1 ? 's' : ''} scanned</span>}
          {scanning && <span className={styles.scanBadge} style={{ background: '#fef9c3', color: '#854d0e' }}>⏳ Scanning…</span>}
        </div>
        <div className={styles.navRight}>
          {onBack && <button className={styles.btnGhost} onClick={onBack}>← Back</button>}
        </div>
      </header>

      <div className={styles.body}>

        {/* ══ UPLOAD HEADER ═══════════════════════════════ */}
        <div className={styles.uploadHeader}>
          <div
            className={[styles.dropZone, dragging ? styles.dragging : '', files.length ? styles.hasFile : ''].join(' ')}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                   style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

            {!files.length && !scanning && (
              <div className={styles.dropInner}>
                <span className={styles.uploadIco}>☁️</span>
                <span className={styles.dropTitle}>Drop ticket here or <u>browse</u></span>
                <span className={styles.dropSub}>PDF · JPG · PNG · max 10MB · auto-fills form</span>
              </div>
            )}

            {scanning && (
              <div className={styles.dropInner}>
                <span className={styles.scanSpin}>🔍</span>
                <span className={styles.dropTitle}>Scanning…</span>
                <div className={styles.scanBar}><div className={styles.scanFill} /></div>
              </div>
            )}

            {files.length > 0 && !scanning && (
              <div className={styles.fileChips}>
                {files.map((f, i) => (
                  <div key={i} className={styles.fileChip}>
                    <span>{f.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                    <span className={styles.chipName}>{f.name}</span>
                    <span className={styles.chipSize}>{(f.size / 1024).toFixed(0)}KB</span>
                    <button className={styles.chipDel}
                            onClick={e => { e.stopPropagation(); setFiles(p => p.filter((_, j) => j !== i)) }}>✕</button>
                  </div>
                ))}
                <div className={styles.addMore} onClick={e => { e.stopPropagation(); fileRef.current.click() }}>+ Add more</div>
              </div>
            )}
          </div>
        </div>

        {/* ══ FORM CARD ════════════════════════════════════ */}
        <div className={styles.formCard}>

          {/* Errors */}
          {errors.length > 0 && (
            <div className={styles.errBanner}>
              {errors.map((e, i) => <span key={i}>⚠ {e}</span>)}
            </div>
          )}
          {saved && <div className={styles.successBanner}>Data saved successfully.</div>}

          {/* ── INVOICE DETAILS (common, entered once) ── */}
          <Accordion icon="🧾" title="Invoice Details" subtitle={invoiceSubtitle}
                     open={openSections.invoice} onToggle={() => toggleSection('invoice')}
                     bodyClassName={styles.invoiceAccordionBody}>
          <div className={[styles.compactRow, styles.invoiceGrid].join(' ')}>
            <FG label="Ref">
              <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Auto / Manual" />
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
            <FG label="Invoice Type">
              <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)}>
                {INV_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FG>
          </div>
          </Accordion>

          {/* ── FLIGHT SEGMENT — booking-level, shared by every passenger.
               Same card style/accordion/spacing as Invoice Details; content
               is a table instead of field groups. ── */}
          <Accordion icon="✈️" title="Flight Segment" subtitle={segmentSubtitle}
                     open={openSections.segments} onToggle={() => toggleSection('segments')}
                     bodyClassName={styles.invoiceAccordionBody}>
          <div className={styles.segTable}>
            <div className={styles.paxTableHead}>Travel Date</div>
            <div className={styles.paxTableHead}>Flight No</div>
            <div className={styles.paxTableHead}>From</div>
            <div className={styles.paxTableHead}>To</div>
            <div className={styles.paxTableHead}>Departure Time</div>
            <div className={styles.paxTableHead}>Arrival Time</div>
            <div className={styles.paxTableHead}>Class</div>
            <div className={styles.paxTableHead}>CRS Name</div>
            <div className={styles.paxTableHead}>CRS PNR</div>
            <div className={styles.paxTableHead}>Airline PNR</div>
            <div className={styles.paxTableHead}>Fare Basis</div>

            {segments.map((s, si) => (
              <Fragment key={si}>
                <div className={styles.paxTableCell}>
                  <input type="date" value={s.travelDate} onChange={e => updateSegment(si, 'travelDate', e.target.value)} />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.flightNo} onChange={e => updateSegment(si, 'flightNo', e.target.value.toUpperCase())} placeholder="e.g. AI2779" />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.from} onChange={e => updateSegment(si, 'from', e.target.value.toUpperCase())} placeholder="e.g. MAA" maxLength={4} />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.to} onChange={e => updateSegment(si, 'to', e.target.value.toUpperCase())} placeholder="e.g. JDH" maxLength={4} />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="time" value={s.depTime} onChange={e => updateSegment(si, 'depTime', e.target.value)} />
                </div>
                <div className={styles.paxTableCell}>
                  <input type="time" value={s.arrTime} onChange={e => updateSegment(si, 'arrTime', e.target.value)} />
                </div>
                <div className={styles.paxTableCell}>
                  <select value={s.travelClass} onChange={e => updateSegment(si, 'travelClass', e.target.value)}>
                    <option value="">Select</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.paxTableCell}>
                  <select value={s.crsName} onChange={e => updateSegment(si, 'crsName', e.target.value)}>
                    <option value="">Select</option>
                    {CRS_NAMES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.crsPnr} onChange={e => updateSegment(si, 'crsPnr', e.target.value.toUpperCase())} placeholder="CRS PNR" />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.airlinePnr} onChange={e => updateSegment(si, 'airlinePnr', e.target.value.toUpperCase())} placeholder="e.g. H1XP6V" maxLength={8} />
                </div>
                <div className={styles.paxTableCell}>
                  <input value={s.fareBasis} onChange={e => updateSegment(si, 'fareBasis', e.target.value.toUpperCase())} placeholder="e.g. UU1YX7II" />
                  {segments.length > 1 && (
                    <button className={styles.removePaxBtn} onClick={() => removeSegment(si)}>✕</button>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          <div className={styles.addSegmentWrap}>
            <button className={styles.addPaxChip} onClick={addSegment}>+ Add Segment</button>
          </div>
          </Accordion>

          {/* ── PASSENGER MANAGEMENT — one shared Passenger Information
               table, one row per passenger. Flight Segments live in the
               standalone card above, shared across all passengers. ── */}
          <Accordion icon="👥" title="Passenger Management" subtitle={flightSubtitle}
                     open={openSections.flight} onToggle={() => toggleSection('flight')}
                     headerAction={
                       <div className={styles.paxBtns}>
                         <span className={styles.paxCount}>{passengers.length} pax</span>
                         <button className={styles.circleBtn} onClick={addPax} title="Add passenger">＋</button>
                       </div>
                     }>
          <div className={styles.paxTable}>
            <div className={styles.paxTableHead}>Passenger</div>
            <div className={styles.paxTableHead}>Ticket No.</div>
            <div className={styles.paxTableHead}>Phone</div>
            <div className={styles.paxTableHead}>Currency</div>
            <div className={styles.paxTableHead}>Basic</div>
            <div className={styles.paxTableHead}>K3</div>
            <div className={styles.paxTableHead}>YQ</div>
            <div className={styles.paxTableHead}>YR</div>
            <div className={styles.paxTableHead}>Other Chg</div>
            <div className={styles.paxTableHead}>Markup</div>
            <div className={styles.paxTableHead}>Discount</div>
            <div className={styles.paxTableHead}>Total</div>
            <div className={styles.paxTableHead}>Same Party</div>

            {passengers.map((p, pi) => {
              const matched = scannedNames && p.passengerName
                ? scannedNames.has(normName(p.passengerName))
                : null
              return (
                <Fragment key={pi}>
                  <div className={styles.paxTableCell}>
                    <input value={p.passengerName} onChange={e => updatePax(pi, 'passengerName', e.target.value.toUpperCase())} placeholder="Full name" />
                    {matched !== null && (
                      <span className={matched ? styles.matchTagOk : styles.matchTagWarn}>{matched ? '✓' : '⚠'}</span>
                    )}
                  </div>
                  <div className={styles.paxTableCell}>
                    <input value={p.ticketNo} onChange={e => updatePax(pi, 'ticketNo', e.target.value.replace(/\D/g, ''))}
                           placeholder="13-digit" maxLength={13}
                           className={p.ticketNo ? (p.ticketNo.length === 13 ? styles.ok : styles.err) : ''} />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input value={p.cellNo} onChange={e => updatePax(pi, 'cellNo', e.target.value.replace(/\D/g, ''))} placeholder="Phone" maxLength={12} />
                  </div>
                  <div className={styles.paxTableCell}>
                    <select value={p.currency} onChange={e => updatePax(pi, 'currency', e.target.value)}>
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.basicAm} onChange={e => updatePax(pi, 'basicAm', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.k3} onChange={e => updatePax(pi, 'k3', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.yq} onChange={e => updatePax(pi, 'yq', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.yr} onChange={e => updatePax(pi, 'yr', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.otherChg} onChange={e => updatePax(pi, 'otherChg', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.markup} onChange={e => updatePax(pi, 'markup', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <input type="number" value={p.discount} onChange={e => updatePax(pi, 'discount', e.target.value)} placeholder="0" />
                  </div>
                  <div className={styles.paxTableCell}>
                    <span className={styles.paxRowTotal}>{p.total}</span>
                  </div>
                  <div className={[styles.paxTableCell, styles.paxTablePartyCell].join(' ')}>
                    <label className={styles.checkboxLbl}>
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
                      <button className={styles.removePaxBtn} onClick={() => removePaxAt(pi)}>✕ Remove</button>
                    )}
                  </div>
                </Fragment>
              )
            })}
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

          {/* ── ADDITIONAL DETAILS & SUMMARY (75%)  +  GRAND TOTAL (25%) ──
               Same accordionHead / compactRow / .fg classes as Flight
               Details — identical header, border, padding, input height,
               typography — just split into two side-by-side cards. ── */}
          <div className={styles.bottomGrid}>

            <div className={styles.bottomCard}>
              <div className={styles.accordionHead}>
                <span className={styles.accordionTitle}>📋 Additional Details &amp; Summary</span>
              </div>
              <div className={styles.accordionBody}>
                <div className={styles.compactRow}>
                  <FG label="Supplier" width={150}>
                    <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                      <option value="">Select</option>
                      {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </FG>
                  <FG label="Paid Via" width={150}>
                    <select value={paidVia} onChange={e => setPaidVia(e.target.value)}>
                      <option value="">Select</option>
                      {PAID_VIA.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </FG>
                  <FG label="Team Member" width={130}>
                    <select value={teamMember} onChange={e => setTeamMember(e.target.value)}>
                      <option value="">Select</option>
                      {TEAM_MEMBERS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </FG>
                  <FG label="Club" width={140}>
                    <select value={club} onChange={e => setClub(e.target.value)}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </FG>
                  <FG label="Remark" grow="1 1 0%" width={150}>
                    <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="Optional remarks" />
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
                  {passengers[0]?.currency || 'INR'} {parseFloat(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
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

/* ── Collapsible Section ──────────────────────── */
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

/* ── Passenger-specific Party/GSTIN/Place of Supply override popup ── */
function PartyOverrideModal({ passenger, onSave, onClose }) {
  const [partyOverride, setPartyOverride] = useState(passenger.partyOverride)
  const [gstinOverride, setGstinOverride] = useState(passenger.gstinOverride)
  const [placeSupplyOverride, setPlaceSupplyOverride] = useState(passenger.placeSupplyOverride)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span>
            Override Party Details
            {passenger.passengerName && <em>— {passenger.passengerName}</em>}
          </span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>Party Name *</div>
            <input className={styles.overrideInput} value={partyOverride}
                   onChange={e => setPartyOverride(e.target.value)}
                   placeholder="Party / Client" autoFocus />
          </div>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>GSTIN</div>
            <input className={styles.overrideInput} value={gstinOverride}
                   onChange={e => setGstinOverride(e.target.value.toUpperCase())}
                   placeholder="15-char GSTIN" maxLength={15} />
          </div>
          <div className={styles.overrideModalField}>
            <div className={styles.paxSubheading}>Place of Supply</div>
            <input className={styles.overrideInput} value={placeSupplyOverride}
                   onChange={e => setPlaceSupplyOverride(e.target.value)}
                   placeholder="State" />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.manageBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn}
                  onClick={() => onSave({ partyOverride, gstinOverride, placeSupplyOverride })}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Field Group ─────────────────────────────── */
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
