import { useState } from 'react'
import UploadPage from './components/UploadPage.jsx'
import FlightSaleForm from './components/Flight/FlightSaleForm.jsx'
import TrainSaleForm from './components/Train/TrainSaleForm.jsx'
// import Hotel from './components/Hotel/Hotel.jsx'
import HotelForm from './components/Hotel/HotelForm.jsx'

export default function App() {
  // page: 'upload' | 'form'
  const [page, setPage] = useState('upload')
  const [scannedData, setScannedData] = useState(null)
  const [bookingType, setBookingType] = useState('flight')

  const goToForm = (data = null, type = 'flight') => {
    setScannedData(data)
    setBookingType(type)
    setPage('form')
  }

  const goToUpload = () => {
    setScannedData(null)
    setPage('upload')
  }

  if (page === 'upload') return <UploadPage onNext={goToForm} />

  if (bookingType === 'train') return <TrainSaleForm onBack={goToUpload} />
//  if (bookingType === 'hotel')  return <Hotel />
if (bookingType === 'hotel')  return <HotelForm />
  return <FlightSaleForm initialScan={scannedData} onBack={goToUpload} />
}
