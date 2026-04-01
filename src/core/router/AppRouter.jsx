import React from 'react'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import AdminLayout from '../../shared/components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import Login from '../../features/auth/Login'
import Dashboard from '../../features/dashboard/Dashboard'
import Applications from '../../features/applications/Applications'
import Members from '../../features/members/Members'
import MemberProfile from '../../features/members/MemberProfile'
import Chits from '../../features/chits/Chits'
import ChitDetails from '../../features/chits/ChitDetails'
import MonthlyOperations from '../../features/finance/MonthlyOperations'
import Contributions from '../../features/finance/Contributions'
import Loans from '../../features/finance/Loans'
import Ledger from '../../features/finance/Ledger'
import Auctions from '../../features/auctions/Auctions'
import Payouts from '../../features/payouts/Payouts'
import Notifications from '../../features/notifications/Notifications'
import Profile from '../../features/auth/Profile'

const router = createHashRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'chits', element: <Chits /> },
          { path: 'chits/:id', element: <ChitDetails /> },
          { path: 'applications', element: <Applications /> },
          { path: 'kyc', element: <Applications /> },
          { path: 'operations', element: <MonthlyOperations /> },
          { path: 'members', element: <Members /> },
          { path: 'members/:id', element: <MemberProfile /> },
          { path: 'contributions', element: <Contributions /> },
          { path: 'loans', element: <Loans /> },
          { path: 'ledger', element: <Ledger /> },
          { path: 'payouts', element: <Payouts /> },
          { path: 'auctions', element: <Auctions /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'profile', element: <Profile /> },
          { path: '*', element: <Navigate to="/" replace /> }
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> }
])

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter
