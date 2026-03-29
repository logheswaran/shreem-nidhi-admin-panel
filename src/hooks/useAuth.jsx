import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial user check
    const initAuth = async () => {
      try {
        const fullUser = await authService.getCurrentUser()
        if (fullUser) {
          setUser(fullUser)
          setProfile(fullUser.profile)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    // Check for demo mode session
    const isDemo = localStorage.getItem('sreem_nidhi_demo') === 'true'
    if (isDemo) {
      setUser({ id: 'demo-user', email: 'demo@sreemnidhi.com' })
      setProfile({ full_name: 'Heritage Demo Admin', role_type: 'admin' })
      setLoading(false)
      return
    }

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const fullUser = await authService.getCurrentUser()
        setUser(fullUser)
        setProfile(fullUser?.profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    signIn: async (phone, password) => {
      if (phone === 'demo' || password === 'demo') {
        localStorage.setItem('sreem_nidhi_demo', 'true')
        window.location.reload()
      } else {
        return authService.signIn(phone, password)
      }
    },
    signOut: async () => {
      localStorage.removeItem('sreem_nidhi_demo')
      await authService.signOut()
      setUser(null)
      setProfile(null)
    },
    isAdmin: profile?.role_type === 'admin',
    isStaff: profile?.role_type === 'staff',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
