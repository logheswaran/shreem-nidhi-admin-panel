import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Landmark, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Login, 2: OTP (Placeholder)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const { signIn, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) return null
  if (user) return <Navigate to="/" replace />

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phoneNumber || !password) {
      toast.error('Please enter both phone number and password')
      return
    }

    setLoading(true)
    try {
      await signIn(phoneNumber, password)
      toast.success('Securely logged in!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Identity verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto focus next
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleDemoMode = () => {
    // Mock login for UI preview
    setLoading(true)
    setTimeout(() => {
      toast.success('Entering Heritage Demo Mode')
      window.location.href = '/'
    }, 800)
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 selection:bg-brand-gold/20 selection:text-brand-goldDark overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full heritage-gradient opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-gold opacity-5 blur-3xl"></div>
      </div>

      {/* Main Authentication Container */}
      <main className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden soft-glow relative z-10 border border-brand-gold/10">
        <div className="p-8 md:p-12 flex flex-col items-center">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-2 mb-12">
            <div className="w-14 h-14 heritage-gradient rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-500">
              <Landmark className="text-white w-8 h-8" />
            </div>
            <span className="font-headline text-3xl font-bold tracking-tighter text-brand-gold mt-4">SreemNidhi</span>
          </div>

          {/* Flow Container */}
          <div className="w-full space-y-10">
            {step === 1 ? (
              /* Step 1: Secure Login */
              <section className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                  <h2 className="font-headline text-2xl font-bold text-on-surface leading-none">Secure Access</h2>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30 group-focus-within:text-brand-gold transition-colors w-5 h-5" />
                      <input 
                        type="tel"
                        className="w-full bg-surface-container/30 border-b-2 border-brand-gold/20 focus:border-brand-gold py-4 pl-12 pr-4 text-on-surface focus:ring-0 focus:outline-none placeholder:text-brand-text/20 font-medium transition-all rounded-t-2xl"
                        placeholder="+91 00000 00000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase ml-1">Security Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30 group-focus-within:text-brand-gold transition-colors w-5 h-5" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-surface-container/30 border-b-2 border-brand-gold/20 focus:border-brand-gold py-4 pl-12 pr-4 text-on-surface focus:ring-0 focus:outline-none placeholder:text-brand-text/20 font-medium transition-all rounded-t-2xl"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/30 hover:text-brand-gold transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="rounded-full border-brand-gold/30 text-brand-gold focus:ring-brand-gold w-4 h-4 bg-surface" />
                      <span className="text-xs text-on-surface-variant group-hover:text-brand-navy transition-colors">Remember device</span>
                    </label>
                    <a href="#" className="text-xs font-bold text-brand-gold hover:underline underline-offset-4 decoration-brand-gold/30">Forgot Access?</a>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full heritage-gradient text-white py-5 rounded-full font-bold text-base shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Secure Login
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      localStorage.setItem('sreem_nidhi_demo', 'true');
                      handleDemoMode();
                    }}
                    className="w-full mt-4 py-4 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-gold/60 transition-all border border-brand-gold/20 rounded-full"
                  >
                    Enter Demo Mode (UI Preview)
                  </button>
                </form>
              </section>
            ) : (
              /* Step 2: OTP Verification (UI Ready) */
              <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full border-2 border-brand-gold text-brand-gold flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                  <h2 className="font-headline text-2xl font-bold text-on-surface leading-none">OTP Verification</h2>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-on-surface-variant leading-relaxed">Enter the 6-digit verification code sent to your registered mobile device.</p>
                  
                  <div className="flex justify-between gap-3">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength="1"
                        className="w-12 h-14 bg-surface-container/30 border-b-2 border-brand-gold/20 text-center text-xl font-bold text-brand-navy focus:border-brand-gold focus:outline-none rounded-t-xl transition-all"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                      />
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-surface-container text-on-surface-variant py-5 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-gold/5 transition-all border border-brand-gold/5"
                  >
                    Verify & Join
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </button>

                  <p className="text-center text-xs text-on-surface-variant">Didn't receive code? <button className="text-brand-gold font-bold hover:underline">Resend OTP</button></p>
                </div>
              </section>
            )}
          </div>

          {/* Security Badges */}
          <footer className="mt-16 w-full pt-10 border-t border-brand-gold/5">
            <div className="flex justify-center gap-6 text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-brand-gold transition-colors">Privacy</a>
              <span className="opacity-20">•</span>
              <a href="#" className="hover:text-brand-gold transition-colors">Security</a>
              <span className="opacity-20">•</span>
              <a href="#" className="hover:text-brand-gold transition-colors">Terms</a>
            </div>
            <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span className="text-[8px] tracking-[0.2em] font-black uppercase text-brand-navy">256-bit AES</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-[8px] tracking-[0.2em] font-black uppercase text-brand-navy">PCI DSS</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Contextual Alert */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/90 backdrop-blur-md border-l-4 border-red-500 p-5 soft-glow flex items-start gap-4 rounded-2xl shadow-xl transition-all hover:scale-105 duration-300">
          <Info className="text-red-500 w-6 h-6 shrink-0" />
          <div>
            <p className="font-headline font-bold text-sm text-brand-navy">Session Auto-Expiry</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed opacity-80">Administrator sessions expire after 10 minutes of inactivity for security.</p>
          </div>
        </div>
      </div>

      {/* Support Access */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-white text-brand-gold rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-brand-gold/10 group">
          <HelpCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Administrator Label (Bottom Left) */}
      <div className="fixed bottom-0 left-0 z-50 p-6 hidden lg:block">
        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-5 rounded-tr-[2.5rem] border-t border-r border-brand-gold/10 shadow-2xl">
          <div className="w-12 h-12 rounded-full heritage-gradient flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-gold">Administrator</span>
            <span className="text-sm font-headline font-bold text-brand-navy">System Control</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
