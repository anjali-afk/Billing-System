const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10), o = n % 10
  return TENS[t] + (o ? ' ' + ONES[o] : '')
}

function threeDigits(n) {
  const h = Math.floor(n / 100), r = n % 100
  return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? twoDigits(r) : '')
}

/* Indian numbering system: crore / lakh / thousand / hundred. */
export function numberToWords(amount) {
  const n = Math.round(Math.abs(Number(amount) || 0))
  if (n === 0) return 'Zero'

  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const hundred = n % 1000

  const parts = []
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh')
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand')
  if (hundred) parts.push(threeDigits(hundred))

  return parts.join(' ')
}

export function amountInWords(amount, currency = 'INR') {
  const unit = currency === 'INR' ? 'Rupees' : currency
  return `${unit} ${numberToWords(amount)} Only`
}
