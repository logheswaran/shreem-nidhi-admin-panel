import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  '': 'Dashboard',
  'chits': 'Chit Schemes',
  'applications': 'Applications',
  'kyc': 'KYC Verification',
  'operations': 'Monthly Operations',
  'members': 'Members Directory',
  'contributions': 'Contribution Registry',
  'loans': 'Loan Management',
  'ledger': 'Institutional Ledger',
  'payouts': 'Maturity Payouts',
  'auctions': 'Auction Orchestration',
  'notifications': 'Notifications',
  'profile': 'Admin Profile',
}

const Breadcrumbs = () => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  // Don't render breadcrumbs on root dashboard
  if (pathSegments.length === 0) return null

  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      // Check if this is a UUID-like segment (detail page)
      const isId = segment.length > 8 && segment.includes('-')
      const label = isId ? 'Details' : (routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1))
      return { label, path }
    })
  ]

  return (
    <nav className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-brand-gold/30 shrink-0" />
          )}
          {index === crumbs.length - 1 ? (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold whitespace-nowrap">
              {crumb.label}
            </span>
          ) : (
            <Link 
              to={crumb.path}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/30 hover:text-brand-gold transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs
