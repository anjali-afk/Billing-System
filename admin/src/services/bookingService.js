import { fetchBookings, fetchBooking, updateBooking, generateInvoiceNumber as generateInvoiceNumberApi } from '../api/bookingApi.js'

function normalizeBooking(b) {
  return {
    id: b.id,
    created_at: b.created_at ?? '',
    dateTime: b.dateTime ?? '',
    date: b.date ?? '',
    type: b.type ?? '',
    service: b.service ?? b.type ?? '',
    company: b.company ?? '',
    ref: b.ref ?? '',
    invoiceType: b.invoiceType ?? 'Normal',
    invoiceNumber: b.invoiceNumber ?? null,
    party: b.party ?? '',
    gst: b.gst ?? '',
    placeSupply: b.placeSupply ?? '',
    dueDate: b.dueDate ?? '',
    supplier: b.supplier ?? '',
    remarks: b.remarks ?? '',
    paidVia: b.paidVia ?? '',
    teamMember: b.teamMember ?? '',
    club: b.club ?? '',
    pnr: b.pnr ?? '',
    passengerName: b.passengerName ?? '',
    passengers: Array.isArray(b.passengers) ? b.passengers : [],
    passengerDetails: Array.isArray(b.passengerDetails) ? b.passengerDetails : [],
    paxCount: b.paxCount ?? (Array.isArray(b.passengers) ? b.passengers.length : 0),
    route: { from: b.route?.from ?? '', to: b.route?.to ?? '' },
    travelDate: b.travelDate ?? '',
    depTime: b.depTime ?? '',
    arrTime: b.arrTime ?? '',
    airline: b.airline ?? '',
    flightNo: b.flightNo ?? '',
    amount: Number(b.amount) || 0,
    fare: Number(b.fare) || 0,
    status: b.status ?? 'pending',
    tallySynced: Boolean(b.tallySynced),
    files: Array.isArray(b.files) ? b.files : [],
    segments: Array.isArray(b.segments) ? b.segments : [],
  }
}

export async function getBookings() {
  const { data } = await fetchBookings()
  return Array.isArray(data) ? data.map(normalizeBooking) : []
}

export async function getBooking(id) {
  const { data } = await fetchBooking(id)
  return normalizeBooking(data)
}

export async function patchBooking(id, payload) {
  const { data } = await updateBooking(id, payload)
  return data
}

/* Returns the booking's permanent invoice number, generating it (via the
   Financial-Year + prefix sequence on the backend) only the first time —
   every call after that just reuses and returns the already-assigned
   number, never a new one. */
export async function generateInvoiceNumber(id) {
  const { data } = await generateInvoiceNumberApi(id)
  if (!data.success) throw new Error(data.error || 'Failed to generate invoice number')
  return data.invoice_number
}
