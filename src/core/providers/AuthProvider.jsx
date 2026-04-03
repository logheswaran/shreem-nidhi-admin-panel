import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Initial Session Recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session)
      } else {
        setLoading(false)
      }
    })

    // 2. Real-time Auth Listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadProfile(session)
        } else {
          setUser(null)
          setLoading(false)
          localStorage.removeItem('sn_profile_cache')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (session) => {
    setLoading(true) 
    try {
      const userId = session?.user?.id
      const phone = session?.user?.phone

      if (!userId) {
        setLoading(false)
        return
      }

      // Format phone safely
      const formattedPhone = phone ? (phone.startsWith('+') ? phone : `+${phone}`) : null

      // 1. Try Local Storage Cache (Instant)
      const cached = localStorage.getItem('sn_profile_cache')
      if (cached && formattedPhone) {
        const profile = JSON.parse(cached)
        if (profile.mobile_number === formattedPhone) {
          setUser({ ...profile, accessToken: session.access_token })
          setLoading(false)
          return
        }
      }

      // 2. Fallback: Phone-based RPC (Proven to bypass RLS issues)
      if (formattedPhone) {
        // Timeout safety
        const rpcPromise = supabase.rpc('get_profile_by_phone', { p_phone: formattedPhone })
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC Timeout')), 5000)
        )

        try {
          const { data: profile } = await Promise.race([rpcPromise, timeoutPromise])
          
          if (profile) {
            localStorage.setItem('sn_profile_cache', JSON.stringify(profile))
            setUser({ ...profile, accessToken: session.access_token })
          }
        } catch (e) {
          console.error('loadProfile: RPC Critical Failure (likely hang):', e.message)
        }
      }
    } catch (err) {
      console.error('loadProfile: EXCEPTION caught:', err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sn_profile_cache')
    setUser(null)
  }

  const isAdmin = user?.role_type === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
