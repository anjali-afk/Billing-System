/* ── Mock OCR result ─────────────────────────────────────────
   Stands in for a real PDF/image voucher-scan API response.
   Mirrors mockScan.js's shape for Hotel: `stays` holds every stay
   segment found on the voucher — one entry per hotel/city, so a
   multi-hotel itinerary never loses a stay. `rooms` holds every
   guest/room row found. */

export function getMockHotelScanResult() {
  return {
    supplier: 'MakeMyTrip',
    stays: [
      {
        hotelName: 'Taj Lands End', city: 'Mumbai',
        checkIn: '2026-08-10', nights: 2,
        mealPlan: 'CPAI', hotelConfNo: 'TLE998877',
        hotelStaffName: 'Rohan Mehta', hotelEmail: 'reservations@tajlandsend.com',
      },
    ],
    rooms: [
      { guestName: 'RAJESH JEERAWALA', cellNo: '9876543210', roomQty: 1, roomRate: 7500, adults: 2, cwb: 0, cnb: 0, cwbRate: 0, otherChg: 300 },
      { guestName: 'MUKESH KUMAR JAIN', cellNo: '9812345678', roomQty: 1, roomRate: 6800, adults: 2, cwb: 1, cnb: 0, cwbRate: 1200, otherChg: 200 },
    ],
  }
}

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_SIZE = 10 * 1024 * 1024
