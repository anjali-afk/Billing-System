import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import NewInvoice from '../pages/NewInvoice/NewInvoice.jsx'
import Bookings from '../pages/Bookings/Bookings.jsx'
import TrainBookings from '../pages/TrainBookings/TrainBookings.jsx'
import HotelBookings from '../pages/HotelBookings/HotelBookings.jsx'
import Customers from '../pages/Customers/Customers.jsx'
import Companies from '../pages/Companies/Companies.jsx'
import Accounts from '../pages/Accounts/Accounts.jsx'
import TallySync from '../pages/TallySync/TallySync.jsx'
import Reports from '../pages/Reports/Reports.jsx'
import Settings from '../pages/Settings/Settings.jsx'
import NotFound from '../pages/NotFound/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="new-invoice" element={<NewInvoice />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/train" element={<TrainBookings />} />
        <Route path="bookings/hotel" element={<HotelBookings />} />
        <Route path="customers" element={<Customers />} />
        <Route path="companies" element={<Companies />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="tally-sync" element={<TallySync />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
