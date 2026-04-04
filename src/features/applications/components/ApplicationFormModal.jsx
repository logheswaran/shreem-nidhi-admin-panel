import React, { useState } from 'react'
import { X, User, Phone, Briefcase, LayoutGrid, Check, Sparkles } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import PremiumDropdown from '../../../shared/components/ui/PremiumDropdown'

const ApplicationFormModal = ({ isOpen, onClose, onSubmit, chits = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    income: '',
    chit_id: '',
    kyc_status: 'pending'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const selectedChit = chits.find(c => c.id === formData.chit_id)
    
    // Auto-calculate risk for simulation
    const income = Number(formData.income)
    const monthlyAmt = selectedChit?.monthly_amount || 0
    const ratio = (monthlyAmt / income) * 100
    
    let riskLevel = 'LOW'
    let riskReason = 'Income buffer is sufficient.'
    
    if (ratio > 40) {
      riskLevel = 'HIGH'
      riskReason = 'Monthly commitment exceeds 40% of income.'
    } else if (ratio > 25) {
      riskLevel = 'MEDIUM'
      riskReason = 'Income borderline for this commitment.'
    }

    onSubmit({
      ...formData,
      id: `APP-${Math.floor(Math.random() * 1000)}`,
      applied_at: new Date().toISOString(),
      chits: selectedChit,
      profiles: { full_name: formData.name, mobile_number: formData.phone },
      risk: { level: riskLevel, reason: riskReason },
      status: 'pending'
    })
    
    setFormData({ name: '', phone: '', income: '', chit_id: '', kyc_status: 'pending' })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Institutional Applicant">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gold ml-1">Applicant Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
              <input
                required
                className="w-full bg-brand-ivory/30 border border-brand-gold/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-brand-gold/20 focus:outline-none transition-all shadow-inner"
                placeholder="Enter legal name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gold ml-1">Mobile Contact</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
              <input
                required
                className="w-full bg-brand-ivory/30 border border-brand-gold/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-brand-gold/20 focus:outline-none transition-all shadow-inner"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-gold ml-1">Monthly Income (Verified)</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/40" />
              <input
                required
                type="number"
                className="w-full bg-brand-ivory/30 border border-brand-gold/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-brand-gold/20 focus:outline-none transition-all shadow-inner"
                placeholder="0.00"
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
              />
            </div>
          </div>

          <PremiumDropdown 
            label="Target Chit Scheme"
            placeholder="Select Scheme..."
            value={formData.chit_id}
            onChange={(val) => setFormData({ ...formData, chit_id: val })}
            options={chits.map(c => ({
              value: c.id,
              label: `${c.name} (₹${c.monthly_amount}/mo)`
            }))}
          />
        </div>

        <button
          type="submit"
          className="w-full heritage-gradient py-5 rounded-[2rem] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
        >
          <Sparkles className="w-5 h-5" />
          Provision Mock Application
        </button>
      </form>
    </Modal>
  )
}

export default ApplicationFormModal
