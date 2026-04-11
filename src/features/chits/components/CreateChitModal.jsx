import React, { useState } from 'react'
import { Plus, Info, Landmark, Users, Clock, DollarSign } from 'lucide-react'
import { useCreateChit } from '../hooks'
import GlobalModal from '../../../shared/components/ui/GlobalModal'
import PremiumDropdown from '../../../shared/components/ui/PremiumDropdown'

/**
 * FEATURE: Create Chit Modal (Standardized Refactor)
 * Standardized using the central GlobalModal framework.
 */
const InputField = ({ label, icon: Icon, name, type = 'text', placeholder, value, onChange, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2B2620]/40 ml-0.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40 group-focus-within:text-brand-gold transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold transition-all"
        value={value}
        onChange={onChange}
        required
        {...props}
      />
    </div>
  </div>
)

const CreateChitModal = ({ isOpen, onClose }) => {
  const { mutate: createChit, isLoading } = useCreateChit()
  const [formData, setFormData] = useState({
    name: '',
    chit_type: 'traditional',
    monthly_contribution: '',
    max_members: '',
    total_months: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Map UI fields to database schema columns
    const payload = {
      name: formData.name,
      chit_type: formData.chit_type,
      monthly_amount: Number(formData.monthly_contribution),
      total_members: Number(formData.max_members),
      duration_months: Number(formData.total_months),
      status: 'forming',
      // Baseline defaults for required schema columns
      interest_rate_maturity: 15, // 15% default maturity interest
      loan_percentage_cap: 80,     // 80% default loan cap
      loan_interest_rate: 18,      // 18% default loan interest
      commission_rate: 0,
      max_bid_percentage: 40
    }

    createChit(payload, {
      onSuccess: () => {
        onClose()
        setFormData({
          name: '',
          chit_type: 'traditional',
          monthly_contribution: '',
          max_members: '',
          total_months: ''
        })
      }
    })
  }

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Initialize Protocol"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Info Area */}
        <div className="w-full md:w-56 shrink-0 pt-2 border-r border-[#B6955E]/10 pr-10">
          <div className="w-12 h-12 bg-white rounded-2xl border border-brand-gold/20 flex items-center justify-center mb-6 shadow-sm">
            <Plus className="w-6 h-6 text-brand-gold" />
          </div>
          <p className="text-[11px] text-brand-text/50 leading-relaxed font-bold uppercase tracking-wider mb-8">
            Global Governance Framework
          </p>
          <div className="items-start gap-3 mt-auto flex">
            <Info className="w-4 h-4 text-brand-gold mt-0.5" />
            <p className="text-[9px] leading-relaxed text-[#2B2620]/40 font-bold uppercase tracking-widest">
              Methodology selection determines specific payout mechanics.
            </p>
          </div>
        </div>

        {/* Main Creation Form Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField 
              label="Identifier" 
              icon={Landmark} 
              name="name" 
              placeholder="e.g. SreeNidhi Heritage 500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PremiumDropdown 
                label="Methodology"
                value={formData.chit_type}
                onChange={(val) => setFormData({ ...formData, chit_type: val })}
                options={[
                  { value: 'traditional', label: 'Traditional Auction Cycle' },
                  { value: 'random', label: 'Randomized Picking Method' }
                ]}
              />

              <InputField 
                label="Monthly Savings" 
                icon={DollarSign} 
                type="number"
                name="monthly_contribution" 
                placeholder="₹ Amount"
                value={formData.monthly_contribution}
                onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField 
                label="Capacity (Members)" 
                icon={Users} 
                type="number"
                name="max_members" 
                placeholder="e.g. 20"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
              />
              <InputField 
                label="Tenure (Months)" 
                icon={Clock} 
                type="number"
                name="total_months" 
                placeholder="e.g. 20"
                value={formData.total_months}
                onChange={(e) => setFormData({ ...formData, total_months: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full heritage-gradient text-white rounded-xl py-5 font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-gold/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-10"
            >
              {isLoading ? 'Commencing Deployment...' : 'Deploy Protocol'}
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </GlobalModal>
  )
}

export default CreateChitModal
