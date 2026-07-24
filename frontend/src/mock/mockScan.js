/* ── Mock OCR result ─────────────────────────────────────────
   Stands in for a real PDF/image ticket-scan API response.
   Shared by UploadPage (Page 1) and the inline re-scan bar on
   FlightSaleForm (Page 2) so both produce the same shape.

   `legs` holds every flight segment found on the ticket — one
   entry for One Way, two for Round Trip, N for Multi-City /
   connecting itineraries. Parsing must never stop after the
   first leg; every leg on the document becomes its own entry
   here, each with its own fare breakdown. */

export function getMockScanResult() {
  return {
    supplier: 'AIR INDIA',
    legs: [
      {
        airline: 'AIR INDIA', flightNo: 'AI2779',
        airlinePnr: 'H1XP6V', crsPnr: 'ECC8A4', crsName: 'Amadeus',
        travelClass: 'Economy', tripType: 'Round Trip', fareBasis: '',
        travelDate: '2026-07-07', from: 'JDH', to: 'BOM', depTime: '07:00', arrTime: '08:45',
        basicAm: 6166, k3: 373, yq: 0, yr: 0, otherChg: 484,
      },
      {
        airline: 'AIR INDIA', flightNo: 'AI2780',
        airlinePnr: 'H1XP6V', crsPnr: 'ECC8A4', crsName: 'Amadeus',
        travelClass: 'Economy', tripType: 'Round Trip', fareBasis: '',
        travelDate: '2026-07-10', from: 'BOM', to: 'JDH', depTime: '18:20', arrTime: '20:05',
        basicAm: 5834, k3: 349, yq: 0, yr: 0, otherChg: 393,
      },
    ],
    passengers: [
      { passengerName: 'RAJESH JEERAWALA MR', ticketNo: '0985806359387', cellNo: '' },
      { passengerName: 'MUKESH KUMAR JAIN MR', ticketNo: '0985806359388', cellNo: '9876543210' },
      { passengerName: 'SUSHIL JAIN MR', ticketNo: '0985806359389', cellNo: '' },
      { passengerName: 'HITESH JAIN MR', ticketNo: '0985806359390', cellNo: '9812345678' },
    ],
  }
}

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_SIZE = 10 * 1024 * 1024
