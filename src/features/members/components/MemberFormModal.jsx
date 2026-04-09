import React, { useState, useEffect } from 'react'
import { X, Loader2, User, Phone, Mail, LayoutGrid, CheckCircle2 } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import { getChits } from '../../chits/api'
import toast from 'react-hot-toast'
import PremiumDropdown from '../../../shared/components/ui/PremiumDropdown'

const MemberFormModal = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    chit_id: '',
    status: 'active'
  })
  const [chits, setChits] = useState([])
  const [fetchingChits, setFetchingChits] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          full_name: initialData.profiles?.full_name || '',
          mobile_number: initialData.profiles?.mobile_number || '',
          email: initialData.profiles?.email || '',
          chit_id: initialData.chit_id || '',
          status: initialData.status || 'active'
        })
      } else {
        setFormData({
          full_name: '',
          mobile_number: '',
          email: '',
          chit_id: '',
          status: 'active'
        })
      }

      const fetchChitsList = async () => {
        try {
          setFetchingChits(true)
          const data = await getChits()
          setChits(data)
        } catch (error) {
          toast.error('Failed to load chits for assignment')
        } finally {
          setFetchingChits(false)
        }
      }
      fetchChitsList()
    }
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.full_name || !formData.mobile_number) {
      toast.error('Name and Phone are required')
      return
    }
    onSubmit(formData)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Member Profile' : 'Enroll New Member'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Full Identity</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ex: Rajesh Khanna"
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-body focus:outline-none transition-all placeholder:text-brand-text/20"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Secure Contact</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
              <input
                name="mobile_number"
                type="tel"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-body focus:outline-none transition-all placeholder:text-brand-text/20"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Institutional Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rajesh@sreemnidhi.com"
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-body focus:outline-none transition-all placeholder:text-brand-text/20"
              />
            </div>
          </div>


          <PremiumDropdown 
            label="Heritage Portfolio"
            placeholder={fetchingChits ? "Loading portfolios..." : "Unassigned"}
            value={formData.chit_id}
            onChange={(val) => setFormData(prev => ({ ...prev, chit_id: val }))}
            options={chits.map(chit => ({
              value: chit.id,
              label: `${chit.name} (₹${Number(chit.monthly_contribution || 0).toLocaleString()})`
            }))}
          />

          {/* Status */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Standing Status</label>
            <div className="flex gap-4">
              {['active', 'inactive', 'defaulter'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    formData.status === status 
                      ? 'bg-brand-gold/10 border-brand-gold text-brand-goldDark shadow-sm' 
                      : 'bg-white border-brand-gold/5 text-brand-text/40 hover:border-brand-gold/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.status === status && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-brand-ivory text-[#2B2620] text-[10px] font-black uppercase tracking-widest rounded-2xl border border-brand-gold/10 hover:bg-brand-gold/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] heritage-gradient px-8 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              initialData ? 'Update Record' : 'Complete Enrollment'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default MemberFormModal
