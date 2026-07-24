/* Converts a normalized BookingDetail record (from bookingService.getBooking)
   into the exact shape TrainSaleForm expects for `initialData` — mirrors
   bookingToFormData.js's approach for the Flight form. */

const numOrBlank = (v) => (v === null || v === undefined || v === '') ? '' : String(v)

/* markup was split into net (`markup`) + tax (`gst_markup`) on save, so the
   form — which always works with the single GST-inclusive value the user
   typed — needs the two added back together. Re-splitting the already-net
   value on the next save would shrink it every edit cycle if this weren't
   reversed here first. */
function passengerToPaxRow(p) {
  const fullMarkup = (Number(p.markup) || 0) + (Number(p.gst_markup) || 0)
  const partyOverride = p.party_override || ''
  return {
    passengerName: p.passenger_name || '',
    passengerType: p.passenger_type || 'Adult',
    cellNo: p.cell_no || '',
    seatNo: p.seat_no || '',
    status: p.pnr_status || 'Confirmed',
    basic: numOrBlank(p.basic_amount),
    fare: numOrBlank(p.fare),
    irctc: numOrBlank(p.irctc),
    gateway: numOrBlank(p.gateway),
    other: numOrBlank(p.other_charges),
    markup: fullMarkup ? String(fullMarkup) : '',
    total: numOrBlank(p.total) || '0.00',
    sameParty: !partyOverride,
    partyOverride,
    gstinOverride: p.gstin_override || '',
    placeSupplyOverride: p.place_supply_override || '',
  }
}

export function trainToFormData(booking) {
  const journey = (Array.isArray(booking.segments) && booking.segments[0]) || {}
  return {
    ref: booking.ref || '',
    company: booking.company || '',
    service: booking.service || '',
    partyName: booking.party || '',
    gstin: booking.gst || '',
    placeSupply: booking.placeSupply || '',
    dueDate: booking.dueDate || '',
    journey: {
      pnr: journey.pnr || '',
      travelDate: journey.travelDate || '',
      classType: journey.classType || '',
      from: journey.from || '',
      to: journey.to || '',
      trainNumber: journey.trainNumber || '',
    },
    supplier: booking.supplier || '',
    teamMember: booking.teamMember || '',
    passengers: (booking.passengerDetails || []).map(passengerToPaxRow),
  }
}
