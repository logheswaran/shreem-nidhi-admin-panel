import React from 'react'
import Modal from './Modal'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  intent = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={!loading ? onClose : () => {}} title="Action Required">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${intent === 'danger' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'}`}>
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-headline font-bold text-brand-navy mb-4 tracking-tight">{title}</h3>
        <p className="text-sm text-brand-text/60 font-body mb-10 leading-relaxed max-w-sm">
          {message}
        </p>

        <div className="flex gap-4 w-full justify-center">
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] bg-surface-container text-brand-navy border border-brand-gold/10 hover:bg-brand-gold/10 transition-all focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 py-4 px-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] text-white shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none ${intent === 'danger' ? 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-red-500/30' : 'heritage-gradient hover:brightness-110 active:scale-95 shadow-brand-gold/30'}`}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
              <>
                <CheckCircle2 className="w-4 h-4" />
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
