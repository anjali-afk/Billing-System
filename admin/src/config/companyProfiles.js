/* Letterhead / statutory details for each company used on the printed invoice.
   None of this exists anywhere in the database today (Booking only stores
   the company NAME) — these are placeholders. Replace every value below
   with the real registered details before sending an invoice to a client.

   `compGst` (the company's OWN GSTIN, not the client's) is also the source
   of truth for the CGST/SGST vs IGST split on the invoice: its first 2
   digits are compared against the client's GSTIN (booking.gst) to decide
   whether the transaction is intra-state or inter-state. */

const DEFAULT_PROFILE = {
  logo: '',
  compName: '',
  compAddr: '',
  compGst: '',
  compPan: '',
  compEmail: '',
  compWeb: '',
  bankDetails: [],
  reimburseNote: '',
  terms: '',
  gstRate: 0.18,
}

export const COMPANY_PROFILES = {
  'Holiday Chacha PVT LTD': {
    logo: '',
    compName: 'Holiday Chacha PVT LTD',
    compAddr: 'PLACEHOLDER ADDRESS — Holiday Chacha PVT LTD, City, State, PIN',
    compGst: '08AAAAA0000A1Z5', // PLACEHOLDER GSTIN — replace with the real one
    compPan: 'AAAAA0000A', // PLACEHOLDER PAN
    compEmail: 'accounts@holidaychacha.com',
    compWeb: 'www.holidaychacha.com',
    bankDetails: [
      'Bank Name: PLACEHOLDER BANK',
      'Branch: PLACEHOLDER BRANCH',
      'A/c No: PLACEHOLDER ACCOUNT NUMBER',
      'IFSC: PLACEHOLDER0000',
    ],
    reimburseNote: '',
    terms: [
      'Fare once booked is subject to airline cancellation/change fee.',
      'All disputes are subject to local jurisdiction.',
      'Please verify all passenger names and travel dates against the ticket.',
    ].map(l => `# ${l}`).join('\n'),
    gstRate: 0.18,
  },
  'HPD Tourism LLC': {
    logo: '',
    compName: 'HPD Tourism LLC',
    compAddr: 'PLACEHOLDER ADDRESS — HPD Tourism LLC, City, State, PIN',
    compGst: '07AAAAA0000A1Z5', // PLACEHOLDER GSTIN — replace with the real one
    compPan: 'AAAAA0000A', // PLACEHOLDER PAN
    compEmail: 'accounts@hpdtourism.com',
    compWeb: 'www.hpdtourism.com',
    bankDetails: [
      'Bank Name: PLACEHOLDER BANK',
      'Branch: PLACEHOLDER BRANCH',
      'A/c No: PLACEHOLDER ACCOUNT NUMBER',
      'IFSC: PLACEHOLDER0000',
    ],
    reimburseNote: '',
    terms: [
      'Fare once booked is subject to airline cancellation/change fee.',
      'All disputes are subject to local jurisdiction.',
      'Please verify all passenger names and travel dates against the ticket.',
    ].map(l => `# ${l}`).join('\n'),
    gstRate: 0.18,
  },
}

export function getCompanyProfile(companyName) {
  return COMPANY_PROFILES[companyName] || { ...DEFAULT_PROFILE, compName: companyName || '' }
}
