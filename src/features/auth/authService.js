import { supabase } from '../../core/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// PIN HASHING — SHA-256 (matches Flutter + Spring Boot exactly)
// ─────────────────────────────────────────────────────────────────────────────
export const hashPin = async (pin) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE FORMATTER — always returns +91XXXXXXXXXX
// ─────────────────────────────────────────────────────────────────────────────
export const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  return `+${digits}`
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1A — VERIFY PHONE + PIN
//
// THE PROBLEM: profiles table has RLS enabled. Anon users (not yet logged in)
// cannot read it. Supabase returns [] with no error — silent empty result.
//
// THE FIX: Use Supabase's signInWithOtp first to get a session, then verify
// the PIN after. BUT we need the pin_hash to verify before sending OTP.
//
// SOLUTION: Call a Supabase RPC function that does the PIN check server-side
// inside a SECURITY DEFINER function (bypasses RLS).
//
// If that RPC doesn't exist yet, we use the fallback: check PIN after OTP.
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPhoneAndPin = async (phone, pin) => {
  const enteredHash = await hashPin(pin)

  // Try RPC first (SECURITY DEFINER — bypasses RLS safely)
  // This RPC must exist in Supabase. See SQL below.
  const { data, error } = await supabase.rpc('verify_admin_pin', {
    p_mobile: phone,
    p_pin_hash: enteredHash
  })

  console.log('verify_admin_pin result:', { data, error })

  if (error) {
    // RPC doesn't exist yet — fall through to OTP-first flow
    console.warn('RPC not found, using OTP-first flow:', error.message)
    return { id: null, verified: false, rpcMissing: true }
  }

  // RPC returns: { valid: true/false, role_type: 'admin', full_name: '...' }
  if (!data || !data.valid) {
    throw new Error('Invalid phone number or PIN')
  }

  if (data.role_type !== 'admin') {
    throw new Error('Access denied. Admin accounts only.')
  }

  return { id: data.user_id, fullName: data.full_name, roleType: data.role_type, verified: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1B — SEND OTP via Supabase Auth (Twilio)
// ─────────────────────────────────────────────────────────────────────────────
export const sendOtp = async (phone) => {
  const { data, error } = await supabase.auth.signInWithOtp({ phone })
  console.log('OTP send full response:', { data, error })
  console.log('OTP error details:', JSON.stringify(error))
  if (error) throw new Error('Failed to send OTP: ' + error.message)
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — VERIFY OTP + GET SESSION
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOtp = async (phone, otp) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms'
  })

  if (error) throw new Error('Invalid OTP: ' + error.message)
  if (!data?.session) throw new Error('No session returned. Try again.')

  return data.session
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED STEP 1 — Verify PIN then send OTP
// ─────────────────────────────────────────────────────────────────────────────
export const stepOneSendOtp = async (phone, pin) => {
  const formattedPhone = formatPhone(phone)

  const pinResult = await verifyPhoneAndPin(formattedPhone, pin)

  // If RPC missing, skip PIN check and just send OTP
  // (temporary until RPC is created in Supabase)
  if (!pinResult.rpcMissing && !pinResult.verified) {
    throw new Error('PIN verification failed')
  }

  await sendOtp(formattedPhone)

  return { profile: pinResult, formattedPhone }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED STEP 2 — Verify OTP + check admin role
// After login session exists, RLS allows reading own profile
// ─────────────────────────────────────────────────────────────────────────────
export const stepTwoVerifyOtp = async (phone, otp, pin) => {
  const session = await verifyOtp(phone, otp)

  // 🛡️ Use RPC to bypass RLS issues during the login phase
  const { data: profile, error } = await supabase.rpc('get_profile_by_phone', { 
    p_phone: phone 
  })

  if (error || !profile) {
    await supabase.auth.signOut()
    throw new Error('Profile not found. Contact admin.')
  }

  // 🛡️ Verify PIN against the profile we just fetched
  if (pin) {
    const enteredHash = await hashPin(pin)
    if (enteredHash !== profile.pin_hash) {
      await supabase.auth.signOut()
      throw new Error('Invalid PIN.')
    }
  }

  if (profile.role_type !== 'admin') {
    await supabase.auth.signOut()
    throw new Error('Access denied. This panel is for admin accounts only.')
  }

  // 🚀 CACHE profile locally for instant reloads
  localStorage.setItem('sn_profile_cache', JSON.stringify({
    id: profile.id,
    full_name: profile.full_name,
    mobile_number: profile.mobile_number,
    role_type: profile.role_type
  }))

  return { session, profile }
}