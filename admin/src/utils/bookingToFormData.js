/* Converts a normalized BookingDetail record (from bookingService.getBooking)
   into the exact shape FlightSaleForm expects for `initialData` — same field
   names it already uses for header/footer state, passengers (EMPTY_PAX) and
   segments (EMPTY_SEGMENT), so the form can prefill an existing record the
   same way it prefills from an OCR scan. */

const numOrBlank = (v) => (v === null || v === undefined || v === '') ? '' : String(v)

/* Only pure passenger-level fields go on the passenger row (matching
   EMPTY_PAX / paxRowsFromScan). Flight Segment fields (flightNo, from,
   to, travelDate, etc.) are booking-level and live solely in `segments`
   — the backend falls back to `segments[0]` only when a passenger row
   doesn't carry its own value, so baking stale segment values onto the
   passenger row here would silently override any edits made in the
   Flight Segment table on save. */
function passengerToPaxRow(p) {
  const partyOverride = p.party_override || ''
  return {
    passengerName: p.passenger_name || '',
    cellNo: p.cell_no || '',
    ticketNo: p.ticket_no || '',
    sameParty: !partyOverride,
    partyOverride,
    gstinOverride: '',
    placeSupplyOverride: '',
    currency: p.currency || 'INR',
    value: numOrBlank(p.value),
    basicAm: numOrBlank(p.basic_amount),
    k3: numOrBlank(p.k3),
    yq: numOrBlank(p.yq),
    yr: numOrBlank(p.yr),
    otherChg: numOrBlank(p.other_charges),
    markup: numOrBlank(p.markup),
    discount: numOrBlank(p.discount),
    total: numOrBlank(p.total) || '0.00',
  }
}

export function bookingToFormData(booking) {
  return {
    ref: booking.ref || '',
    company: booking.company || '',
    service: booking.service || '',
    partyName: booking.party || '',
    gstin: booking.gst || '',
    placeSupply: booking.placeSupply || '',
    dueDate: booking.dueDate || '',
    invoiceType: booking.invoiceType || 'Normal',
    supplier: booking.supplier || '',
    remark: booking.remarks || '',
    paidVia: booking.paidVia || '',
    teamMember: booking.teamMember || '',
    club: booking.club || '',
    passengers: (booking.passengerDetails || []).map(passengerToPaxRow),
    segments: Array.isArray(booking.segments) ? booking.segments : [],
    files: Array.isArray(booking.files) ? booking.files : [],
  }
}
