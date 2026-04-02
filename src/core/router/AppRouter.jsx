import React, { Suspense, lazy } from 'react'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import AdminLayout from '../../shared/components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import Login from '../../features/auth/Login'

// FEATURE LAZY LOADING (Optimizes Memory & Initial Speed)
const Dashboard = lazy(() => import('../../features/dashboard/Dashboard'))
const Applications = lazy(() => import('../../features/applications/Applications'))
const Members = lazy(() => import('../../features/members/Members'))
const MemberProfile = lazy(() => import('../../features/members/MemberProfile'))
const Chits = lazy(() => import('../../features/chits/Chits'))
const ChitDetails = lazy(() => import('../../features/chits/ChitDetails'))
const MonthlyOperations = lazy(() => import('../../features/finance/MonthlyOperations'))
const Contributions = lazy(() => import('../../features/finance/Contributions'))
const Loans = lazy(() => import('../../features/finance/Loans'))
const Ledger = lazy(() => import('../../features/finance/Ledger'))
const Auctions = lazy(() => import('../../features/auctions/Auctions'))
const Payouts = lazy(() => import('../../features/payouts/Payouts'))
const Notifications = lazy(() => import('../../features/notifications/Notifications'))
const Profile = lazy(() => import('../../features/auth/Profile'))

// Loading Skeleton for Transitions
const FeatureLoader = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] animate-pulse">
    <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin mb-4"></div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/40">Synchronizing Vault...</span>
  </div>
)

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
          { index: true, element: <Suspense fallback={<FeatureLoader />}><Dashboard /></Suspense> },
          { path: 'chits', element: <Suspense fallback={<FeatureLoader />}><Chits /></Suspense> },
          { path: 'chits/:id', element: <Suspense fallback={<FeatureLoader />}><ChitDetails /></Suspense> },
          { path: 'applications', element: <Suspense fallback={<FeatureLoader />}><Applications /></Suspense> },
          { path: 'kyc', element: <Suspense fallback={<FeatureLoader />}><Applications /></Suspense> },
          { path: 'operations', element: <Suspense fallback={<FeatureLoader />}><MonthlyOperations /></Suspense> },
          { path: 'members', element: <Suspense fallback={<FeatureLoader />}><Members /></Suspense> },
          { path: 'members/:id', element: <Suspense fallback={<FeatureLoader />}><MemberProfile /></Suspense> },
          { path: 'contributions', element: <Suspense fallback={<FeatureLoader />}><Contributions /></Suspense> },
          { path: 'loans', element: <Suspense fallback={<FeatureLoader />}><Loans /></Suspense> },
          { path: 'ledger', element: <Suspense fallback={<FeatureLoader />}><Ledger /></Suspense> },
          { path: 'payouts', element: <Suspense fallback={<FeatureLoader />}><Payouts /></Suspense> },
          { path: 'auctions', element: <Suspense fallback={<FeatureLoader />}><Auctions /></Suspense> },
          { path: 'notifications', element: <Suspense fallback={<FeatureLoader />}><Notifications /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<FeatureLoader />}><Profile /></Suspense> },
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
