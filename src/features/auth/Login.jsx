import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stepOneSendOtp, stepTwoVerifyOtp, formatPhone } from './authService'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [otp, setOtp] = useState('')
  const [formattedPhone, setFormattedPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // ── STEP 1: Verify PIN + Send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    if (pin.length < 4) {
      toast.error('Enter your PIN (minimum 4 digits)')
      return
    }

    setLoading(true)
    try {
      const { formattedPhone: fp } = await stepOneSendOtp(phone, pin)
      setFormattedPhone(fp)
      toast.success('OTP sent to your mobile number')
      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      await stepTwoVerifyOtp(formattedPhone, otp, pin)
      toast.success('Login successful! Welcome.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // ── RESEND OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true)
    try {
      await stepOneSendOtp(phone, pin)
      toast.success('OTP resent successfully')
      setOtp('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-xl border border-brand-gold/10">

        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 heritage-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-headline font-bold">S</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-brand-navy">Shreemnidhi</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mt-1">
            Admin Control Panel
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-brand-gold' : 'bg-brand-gold/20'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-brand-gold' : 'bg-brand-gold/20'}`} />
        </div>

        {/* ── STEP 1 FORM ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-brand-gold/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10"
                placeholder="9876543210"
                inputMode="numeric"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">
                PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-brand-gold/20 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.6em] focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10"
                placeholder="••••"
                required
              />
              <p className="text-[9px] text-brand-text/30 font-bold uppercase tracking-widest mt-2 text-center">
                Same PIN you use in the Shreemnidhi app
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10 || pin.length < 4}
              className="w-full heritage-gradient text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl disabled:opacity-40 transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying PIN...
                </>
              ) : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* ── STEP 2 FORM ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
              <p className="text-xs text-green-800 font-bold">OTP sent to</p>
              <p className="text-sm text-green-700 font-black mt-0.5">{formattedPhone}</p>
              <p className="text-[9px] text-green-600 mt-1 uppercase tracking-widest">Check your SMS</p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text/60 mb-2 block">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full border-2 border-brand-gold/20 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.8em] focus:outline-none focus:border-brand-gold/60 focus:ring-4 focus:ring-brand-gold/10 transition-all"
                placeholder="------"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full heritage-gradient text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl disabled:opacity-40 transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying OTP...
                </>
              ) : 'Verify & Login →'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); }}
                className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 hover:text-brand-navy transition-colors"
              >
                ← Change Number
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-brand-gold/70 transition-colors disabled:opacity-40"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
