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
const PaymentDashboard = lazy(() => import('../../features/finance/PaymentDashboard'))
const PaymentGrid = lazy(() => import('../../features/finance/PaymentGrid'))
const Loans = lazy(() => import('../../features/finance/Loans'))
const Ledger = lazy(() => import('../../features/finance/Ledger'))
const Auctions = lazy(() => import('../../features/auctions/Auctions'))
const Payouts = lazy(() => import('../../features/payouts/Payouts'))
const Notifications = lazy(() => import('../../features/notifications/Notifications'))
const RiskPanel = lazy(() => import('../../features/risk/RiskPanel'))
const Reports = lazy(() => import('../../features/reports/Reports'))
const AdminControls = lazy(() => import('../../features/admin/AdminControls'))
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
          { path: 'members', element: <Suspense fallback={<FeatureLoader />}><Members /></Suspense> },
          { path: 'members/:id', element: <Suspense fallback={<FeatureLoader />}><MemberProfile /></Suspense> },
          { path: 'members/applications', element: <Suspense fallback={<FeatureLoader />}><Applications /></Suspense> },
          { path: 'payments', element: <Suspense fallback={<FeatureLoader />}><PaymentDashboard /></Suspense> },
          { path: 'payments/:id', element: <Suspense fallback={<FeatureLoader />}><PaymentGrid /></Suspense> },
          { path: 'operations', element: <Suspense fallback={<FeatureLoader />}><MonthlyOperations /></Suspense> },
          { path: 'loans', element: <Suspense fallback={<FeatureLoader />}><Loans /></Suspense> },
          { path: 'ledger', element: <Suspense fallback={<FeatureLoader />}><Ledger /></Suspense> },
          { path: 'auctions', element: <Suspense fallback={<FeatureLoader />}><Auctions /></Suspense> },
          { path: 'risk', element: <Suspense fallback={<FeatureLoader />}><RiskPanel /></Suspense> },
          { path: 'reports', element: <Suspense fallback={<FeatureLoader />}><Reports /></Suspense> },
          { path: 'notifications', element: <Suspense fallback={<FeatureLoader />}><Notifications /></Suspense> },
          { path: 'admin', element: <Suspense fallback={<FeatureLoader />}><AdminControls /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<FeatureLoader />}><Profile /></Suspense> },
          // Legacy/Compatibility Redirects
          { path: 'applications', element: <Navigate to="/members/applications" replace /> },
          { path: 'contributions', element: <Navigate to="/payments" replace /> },
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
