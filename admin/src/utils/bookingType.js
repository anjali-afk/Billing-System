export const TRAIN_SERVICES = ['Train', 'International Train']

export function isTrainBooking(booking) {
  return TRAIN_SERVICES.includes(booking?.service)
}
