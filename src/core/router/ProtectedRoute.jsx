import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, profile, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-ivory">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-brand-gold font-headline font-bold text-sm tracking-widest animate-pulse">VERIFYING CREDENTIALS...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && profile?.role_type !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <Outlet context={{ user, profile, isAdmin }} />
}

export default ProtectedRoute
