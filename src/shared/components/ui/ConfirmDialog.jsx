import React from 'react'
import Modal from './Modal'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const color = variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-gold/5 text-brand-gold'
  const Icon = variant === 'danger' ? AlertCircle : CheckCircle2

  return (
    <Modal isOpen={isOpen} onClose={!isLoading ? onClose : () => {}} title="Security Confirmation" maxWidth="max-w-md">
      <div className="p-8 text-center bg-white">
        <div className={`w-16 h-16 mx-auto rounded-3xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
           <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-headline font-bold text-[#2B2620] mb-2 tracking-tight">{title}</h3>
        <p className="text-[11px] text-brand-text/50 font-medium mb-8 leading-relaxed max-w-[280px]">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-brand-ivory text-[#2B2620]/40 border border-brand-gold/10 hover:bg-brand-gold/10 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'heritage-gradient hover:brightness-110'}`}
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
