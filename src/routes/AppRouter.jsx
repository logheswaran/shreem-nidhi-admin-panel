import React from 'react'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Applications from '../pages/Applications'
import Members from '../pages/Members'
import Chits from '../pages/Chits'
import ChitDetails from '../pages/ChitDetails'
import MonthlyOperations from '../pages/MonthlyOperations'
import Contributions from '../pages/Contributions'
import Loans from '../pages/Loans'
import Ledger from '../pages/Ledger'
import Auctions from '../pages/Auctions'
import Payouts from '../pages/Payouts'
import Notifications from '../pages/Notifications'
import Profile from '../pages/Profile'

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
          { path: 'kyc', element: <Applications /> }, // Sharing applications for now
          { path: 'operations', element: <MonthlyOperations /> },
          { path: 'members', element: <Members /> },
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
