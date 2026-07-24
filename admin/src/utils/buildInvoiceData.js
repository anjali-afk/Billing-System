import { getCompanyProfile } from '../config/companyProfiles.js'
import { amountInWords } from './numberToWords.js'

const fmt2 = (n) => (Number(n) || 0).toFixed(2)

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`
}

/* Every passenger shares the same booking-level Flight Segment rows (this
   mirrors FlightSaleForm's own model: segments are booking-level, not
   owned by any one passenger) — so every passenger row lists every
   segment. One segment = One Way, two = Round Trip, N = Multi City;
   nothing here special-cases the trip type, it just renders however many
   segments the booking actually has. */
function buildSegmentLines(segments) {
  const routeLines = []
  const dateLines = []
  for (const seg of segments) {
    // Train segments carry trainNumber instead of flightNo — falls back
    // so this same table also reads sensibly for Train invoices.
    const flightPart = seg.flightNo || seg.trainNumber || ''
    const route = [seg.from, seg.to].filter(Boolean).join('-')
    routeLines.push([flightPart, route].filter(Boolean).join(' - '))
    dateLines.push(formatDate(seg.travelDate))
  }
  if (!routeLines.length) { routeLines.push('—'); dateLines.push('—') }
  return { routeLines, dateLines }
}

/* The template's passenger table only has 4 fare columns (Basic, K3, YQ,
   Other) — our data model tracks YR/Other Charges/Markup/Discount
   separately, so everything beyond Basic/K3/YQ is folded into "Other".
   basic + k3 + yq + other must still equal the passenger's stored total
   (same sum FlightSaleForm's calcTotal already produces), so nothing is
   gained or lost by the regrouping. */
function buildPassengerRow(p) {
  const other = (Number(p.yr) || 0) + (Number(p.other_charges) || 0) + (Number(p.markup) || 0) - (Number(p.discount) || 0)
  return {
    passenger_name: p.passenger_name || '',
    ticket_no: p.ticket_no || '',
    basic_amount: fmt2(p.basic_amount),
    k3: fmt2(p.k3),
    yq: fmt2(p.yq),
    other: fmt2(other),
  }
}

/* Splits GST into CGST+SGST (intra-state) vs IGST (inter-state) by
   comparing the first 2 digits (state code) of the company's own GSTIN
   against the client's GSTIN (booking.gst). If the client has no GSTIN
   on file there's nothing to compare, so it defaults to IGST. GST is
   charged only on the agency's processing fee (sum of passenger markups),
   not on the base airfare — the base fare + processing fee already sum to
   exactly the booking's existing grand_total, so nothing about the stored
   total changes; GST is added on top of it. */
function buildGst(booking, profile) {
  const gstRate = profile.gstRate ?? 0.18
  const taxableVal = (booking.passengerDetails || []).reduce((s, p) => s + (Number(p.markup) || 0), 0)
  const companyStateCode = (profile.compGst || '').slice(0, 2)
  const clientStateCode = (booking.gst || '').slice(0, 2)
  const isSplitGST = Boolean(clientStateCode) && clientStateCode === companyStateCode

  const igst = isSplitGST ? 0 : taxableVal * gstRate
  const cgst = isSplitGST ? (taxableVal * gstRate) / 2 : 0
  const sgst = isSplitGST ? (taxableVal * gstRate) / 2 : 0
  const gstOnlyTotal = igst + cgst + sgst

  return { taxableVal, isSplitGST, igst, cgst, sgst, gstOnlyTotal, processingCharges: taxableVal }
}

/* Maps the Bookings dashboard's "Invoice Type" dropdown label to the
   template's own trigger values (InvoiceView.jsx's currentTrigger
   conditionals): Net Invoice hides Gross Total/Processing Fee/GST rows
   entirely; GST Invoice keeps the GST breakdown but drops the
   Processing Fee line; Invoice Print (the default) shows everything. */
const TRIGGER_BY_INVOICE_TYPE = {
  'Invoice Print': 'Invoice_Print',
  'GST Invoice': 'GST_Invoice',
  'Net Invoice': 'Net_Invoice',
}

export function buildInvoiceData(booking, invoiceType) {
  const profile = getCompanyProfile(booking.company)
  const { routeLines, dateLines } = buildSegmentLines(booking.segments || [])
  const gst = buildGst(booking, profile)

  const grandTotal = Number(booking.amount) || 0
  const grossTotal = grandTotal - gst.processingCharges
  const netAmount = grossTotal + gst.processingCharges + gst.gstOnlyTotal

  return {
    // action-bar / template-variant selector — driven by the dashboard's
    // own Invoice Type dropdown; "Invoice_Print" is the default variant
    // when nothing has been selected yet.
    currentTrigger: TRIGGER_BY_INVOICE_TYPE[invoiceType] || 'Invoice_Print',
    isHolidayChacha: booking.company === 'Holiday Chacha PVT LTD',

    // company letterhead
    logo: profile.logo,
    compName: profile.compName,
    compAddr: profile.compAddr,
    compGst: profile.compGst,
    compPan: profile.compPan,
    compEmail: profile.compEmail,
    compWeb: profile.compWeb,

    // invoice meta
    serviceTitle: `${booking.service || 'Flight'} Invoice`,
    invoice_date: formatDate(booking.created_at || booking.date),
    // The invoice number is only ever assigned by clicking "Generate" (see
    // BookingsPanel/generateInvoiceNumber) — View never creates one, it only
    // displays whatever has already been persisted on the booking.
    invoice_no: booking.invoiceNumber || 'Not Generated',

    // bill to
    billToName: booking.party || '',
    billToAddr: '',
    billToGst: booking.gst || '',
    placeOfSupply: booking.placeSupply || '',

    // other details
    customerId: `#${booking.id}`,
    airlineName: booking.airline || '',
    pnr_no: booking.pnr || '',
    due_date: formatDate(booking.dueDate),
    ref_no: booking.ref || '',
    entryBy: booking.teamMember || '',

    // passenger table
    items: (booking.passengerDetails || []).map(buildPassengerRow),
    flightRouteLines: routeLines,
    travelDateLines: dateLines,

    // bank + totals
    bankDetails: profile.bankDetails,
    reimburseNote: profile.reimburseNote,
    grossTotal: fmt2(grossTotal),
    processingCharges: fmt2(gst.processingCharges),
    taxableVal: fmt2(gst.taxableVal),
    isSplitGST: gst.isSplitGST,
    igst: fmt2(gst.igst),
    cgst: fmt2(gst.cgst),
    sgst: fmt2(gst.sgst),
    gstOnlyTotal: fmt2(gst.gstOnlyTotal),
    netAmount: Math.round(netAmount),
    amountInWords: amountInWords(netAmount, booking.passengerDetails?.[0]?.currency || 'INR'),

    // terms + signature
    terms: profile.terms,
    preparedBy: booking.teamMember || '',
  }
}
