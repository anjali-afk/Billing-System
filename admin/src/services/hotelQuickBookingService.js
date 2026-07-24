import { fetchHotelQuickBookings } from '../api/hotelQuickBookingApi.js'

function normalizeHotelQuickBooking(b) {
  return {
    id: b.id,
    refNo: b.refNo ?? '',
    dealId: b.dealId ?? '',
    createdAt: b.createdAt ?? '',
    dateTime: b.dateTime ?? '',
    guestName: b.guestName ?? '',
    destination: b.destination ?? '',
    hotelName: b.hotelName ?? '',
    tourType: b.tourType ?? '',
    bookingType: b.bookingType ?? '',
    handledBy: b.handledBy ?? '',
    checkIn: b.checkIn ?? '',
    checkOut: b.checkOut ?? '',
    nights: b.nights ?? '',
    numRooms: b.numRooms ?? '',
    totalPax: b.totalPax ?? '',
    roomCategory: b.roomCategory ?? '',
    mealPlan: b.mealPlan ?? '',
    hotelStatus: b.hotelStatus ?? '',
    billingStatus: b.billingStatus ?? '',
    voucherStatus: b.voucherStatus ?? '',
    grandTotal: Number(b.grandTotal) || 0,
    balanceAmount: Number(b.balanceAmount) || 0,
    paymentStatus: b.paymentStatus ?? '',
  }
}

export async function getHotelQuickBookings() {
  const { data } = await fetchHotelQuickBookings()
  return Array.isArray(data) ? data.map(normalizeHotelQuickBooking) : []
}
