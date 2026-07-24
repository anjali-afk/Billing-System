import { Plus, LayoutDashboard, Receipt, Plane, TrainFront, Hotel, Users, Building2, Wallet, ArrowUp, BarChart3, Settings } from 'lucide-react'

export const menuItems = [
  { key: 'new',       title: 'New Invoice',   icon: Plus,            path: '/new-invoice', badge: null, end: false },
  { key: 'dashboard', title: 'All Booking',   icon: LayoutDashboard, path: '/',            badge: null, end: true  },
  {
    key: 'billing-engine',
    title: 'Billing Engine',
    icon: Receipt,
    badge: null,
    children: [
      { key: 'flight-bookings', title: 'Flight Bookings', icon: Plane,      path: '/bookings',       end: false },
      { key: 'train-bookings',  title: 'Train Bookings',  icon: TrainFront, path: '/bookings/train', end: false },
      { key: 'hotel-bookings',  title: 'Hotel Bookings',  icon: Hotel,      path: '/bookings/hotel', end: false },
    ],
  },
  { key: 'customers', title: 'Customers',     icon: Users,           path: '/customers',   badge: null, end: false },
  { key: 'companies', title: 'Companies',     icon: Building2,       path: '/companies',   badge: null, end: false },
  { key: 'accounts',  title: 'Accounts',      icon: Wallet,          path: '/accounts',    badge: null, end: false },
  { key: 'tally',     title: 'Tally Sync',    icon: ArrowUp,         path: '/tally-sync',  badge: null, end: false },
  { key: 'reports',   title: 'Reports',       icon: BarChart3,       path: '/reports',     badge: null, end: false },
  { key: 'settings',  title: 'Settings',      icon: Settings,        path: '/settings',    badge: null, end: false },
]
