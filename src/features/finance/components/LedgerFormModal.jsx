import React, { useState, useEffect } from 'react'
import { Loader2, User, IndianRupee, FileText, Calendar, Tag, CheckCircle2 } from 'lucide-react'
import Modal from '../../../shared/components/ui/Modal'
import toast from 'react-hot-toast'
import PremiumDropdown from '../../../shared/components/ui/PremiumDropdown'

const LedgerFormModal = ({ isOpen, onClose, onSubmit, initialData = null, members = [], loading = false }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    transaction_type: 'credit',
    amount: '',
    reference_type: '',
    notes: '',
    created_at: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
    payment_ref: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          user_id: initialData.user_id || '',
          transaction_type: initialData.transaction_type || 'credit',
          amount: Math.abs(initialData.amount) || '',
          reference_type: initialData.reference_type || '',
          notes: initialData.notes || '',
          created_at: new Date(initialData.created_at).toISOString().split('T')[0],
          payment_mode: initialData.payment_mode || 'Cash',
          payment_ref: initialData.payment_ref || ''
        })
      } else {
        setFormData({
          user_id: '',
          transaction_type: 'credit',
          amount: '',
          reference_type: '',
          notes: '',
          created_at: new Date().toISOString().split('T')[0],
          payment_mode: 'Cash',
          payment_ref: ''
        })
      }
    }
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.user_id || !formData.amount || !formData.transaction_type) {
      toast.error('Member, Type, and Amount are required')
      return
    }
    
    
    const { payment_mode, payment_ref, ...payload } = formData
    onSubmit({ 
      payload, 
      metadata: { mode: payment_mode, ref: payment_ref } 
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Adjust Ledger Entry' : 'New Financial Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Selection */}
          <PremiumDropdown 
            label="Account Identity"
            className="md:col-span-2"
            placeholder="Select Member..."
            value={formData.user_id}
            onChange={(val) => setFormData(prev => ({ ...prev, user_id: val }))}
            options={members.map(member => ({
              value: member.user_id,
              label: `${member.profiles?.full_name} (${member.profiles?.mobile_number})`
            }))}
          />

          {/* Transaction Type */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Transaction Nature</label>
            <div className="flex gap-4">
              {[
                { id: 'credit', label: 'Credit (Inflow)', color: 'text-green-600', bg: 'bg-green-50' },
                { id: 'debit', label: 'Debit (Outflow)', color: 'text-red-600', bg: 'bg-red-50' }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, transaction_type: type.id }))}
                  className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    formData.transaction_type === type.id 
                      ? `border-[#2B2620] ${type.bg} ${type.color} shadow-sm` 
                      : 'bg-white border-brand-gold/5 text-brand-text/40 hover:border-brand-gold/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.transaction_type === type.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Capital Impact</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30 font-bold">₹</div>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-[#2B2620] focus:outline-none transition-all placeholder:text-brand-text/20"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Protocol Date</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
              <input
                name="created_at"
                type="date"
                value={formData.created_at}
                onChange={handleChange}
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-body focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Reference Type */}
          <PremiumDropdown 
            label="Category Ref"
            placeholder="General Entry"
            value={formData.reference_type}
            onChange={(val) => setFormData(prev => ({ ...prev, reference_type: val }))}
            options={[
              { value: '', label: 'General Entry' },
              { value: 'contribution', label: 'Contribution' },
              { value: 'loan_disbursement', label: 'Loan Disbursement' },
              { value: 'loan_repayment', label: 'Loan Repayment' },
              { value: 'maturity_payout', label: 'Maturity Payout' },
              { value: 'auction_dividend', label: 'Auction Dividend' },
              { value: 'admin_adjustment', label: 'Admin Adjustment' }
            ]}
          />
          
          {/* Notes */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1">Audit Notes</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-gold transition-colors" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter transaction context or proof references..."
                rows={3}
                className="w-full bg-brand-ivory/50 border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-body focus:outline-none transition-all placeholder:text-brand-text/20 resize-none"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="space-y-4 md:col-span-2 pt-4 border-t border-brand-gold/5">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/60 ml-1 block">Institutional Payment Mode</label>
             <div className="flex flex-wrap gap-2">
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode }))}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.payment_mode === mode 
                        ? 'bg-[#2B2620] text-white shadow-lg' 
                        : 'bg-white border border-brand-gold/10 text-[#2B2620] hover:bg-brand-gold/5'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
             </div>

             {formData.payment_mode !== 'Cash' && (
                <div className="animate-in slide-in-from-top duration-300">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#2B2620]/30 ml-1 block mb-2">
                     {formData.payment_mode === 'Cheque' ? 'Instrument Number' : 'Transaction / Reference ID'}
                   </label>
                   <input 
                     name="payment_ref"
                     value={formData.payment_ref}
                     onChange={handleChange}
                     className="w-full bg-brand-ivory/30 border border-brand-gold/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/30 font-bold text-[#2B2620]"
                     placeholder={`Enter ${formData.payment_mode} reference...`}
                   />
                </div>
             )}
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
                Auditing...
              </>
            ) : (
              initialData ? 'Update Ledger' : 'Commit Entry'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default LedgerFormModal
