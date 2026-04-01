import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { authService } from '../supabase/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

const TIMEOUT_DURATION = 10 * 60 * 1000 // 10 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef(null)

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (user && !localStorage.getItem('sreem_nidhi_demo')) {
      timeoutRef.current = setTimeout(() => {
        handleAutoLogout()
      }, TIMEOUT_DURATION)
    }
  }

  const handleAutoLogout = async () => {
    toast.error('Session expired due to inactivity', { 
      icon: '⏳',
      duration: 5000 
    })
    signOut()
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const fullUser = await authService.getCurrentUser()
        if (fullUser) {
          setUser(fullUser)
          setProfile(fullUser.profile)
          resetTimeout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimeout)
    })

    const isDemo = localStorage.getItem('sreem_nidhi_demo') === 'true'
    if (isDemo) {
      setUser({ id: 'demo-user', email: 'demo@sreemnidhi.com' })
      setProfile({ full_name: 'Heritage Demo Admin', role_type: 'admin' })
      setLoading(false)
    }

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const fullUser = await authService.getCurrentUser()
        setUser(fullUser)
        setProfile(fullUser?.profile)
        resetTimeout()
      } else {
        setUser(null)
        setProfile(null)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimeout)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [user])

  const signOut = async () => {
    localStorage.removeItem('sreem_nidhi_demo')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    await authService.signOut()
    setUser(null)
    setProfile(null)
  }

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
    signOut,
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
