/* ── Reference data for the B2B Quote Form ─────────────────────
   Stands in for real inventory/rate-card APIs (agency list, city →
   hotel → room-category cascade, supplier/currency lists, activity
   and transport rate cards). Shape mirrors mockHotelScan.js's role
   as a mock data source for a form, just reference lists instead of
   a scan result. */

export const AGENCIES = [
  'Wanderlust Travels',
  'Sunrise Holidays',
  'Blue Horizon Tours',
  'Everest Voyages',
]

export const CITIES = ['Jaipur', 'Goa', 'Udaipur', 'Dubai']

export const HOTELS_BY_CITY = {
  Jaipur: ['Taj Jaipur', 'ITC Rajputana'],
  Goa: ['Taj Fort Aguada', 'Leela Goa'],
  Udaipur: ['Taj Lake Palace', 'Oberoi Udaivilas'],
  Dubai: ['Atlantis The Palm', 'Burj Al Arab'],
}

export const ROOMS_BY_HOTEL = {
  'Taj Jaipur': ['Deluxe Room', 'Luxury Room'],
  'ITC Rajputana': ['Classic Room', 'Executive Room'],
  'Taj Fort Aguada': ['Garden View Room', 'Sea View Room'],
  'Leela Goa': ['Premier Room', 'Villa'],
  'Taj Lake Palace': ['Luxury Room', 'Palace Suite'],
  'Oberoi Udaivilas': ['Premier Room', 'Luxury Suite'],
  'Atlantis The Palm': ['Deluxe Room', 'Ocean Suite'],
  'Burj Al Arab': ['Deluxe Suite', 'Panoramic Suite'],
}

export const SUPPLIERS = ['Direct Hotel', 'MakeMyTrip', 'Goibibo', 'Booking.com', 'Agoda', 'Travel Agent']

export const CURRENCIES = ['INR', 'USD', 'AED', 'THB', 'GBP', 'EUR']

/* rate = flat per-vehicle cost, added once per Activity Row that uses it */
export const TRANSPORT_TYPES = [
  { label: 'None', rate: 0 },
  { label: 'Sedan (4 Seater)', rate: 1500 },
  { label: 'SUV (6 Seater)', rate: 2500 },
  { label: 'Tempo Traveller (12 Seater)', rate: 4000 },
]

/* rate = per-person price (PPP) */
export const ACTIVITIES = [
  { name: 'City Tour', code: 'ACT-CTY', adultRate: 1200, childRate: 800 },
  { name: 'Desert Safari', code: 'ACT-DSF', adultRate: 2500, childRate: 1800 },
  { name: 'Water Sports', code: 'ACT-WSP', adultRate: 1800, childRate: 1200 },
  { name: 'Heritage Walk', code: 'ACT-HWK', adultRate: 900, childRate: 600 },
]

export const PRICE_TYPES = ['Per Person', 'Per Couple', 'Package Price']

export const PAYMENT_MODES = ['Bank Transfer', 'Credit Card', 'UPI', 'Cheque']
