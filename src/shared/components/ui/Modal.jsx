import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 
          OVERLAY GOBAL UPGRADE: 
          - No dark/black tint (rgba 255,255,255,0.35)
          - Ice-frosted blur (18px)
          - High saturation (160%)
      */}
      <div 
        className="fixed inset-0 transition-opacity duration-500 cursor-default"
        style={{
          background: 'rgba(255, 255, 255, 0.35)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)'
        }}
        onClick={onClose}
      />
      
      {/* Modal Content - Elevated over the ice-overlay */}
      <div className={`relative bg-brand-ivory w-full ${maxWidth} rounded-[3rem] shadow-2xl overflow-hidden border border-brand-gold/10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 my-auto`}>
        {/* Header */}
        <div className="px-10 py-8 border-b border-brand-gold/5 flex justify-between items-center bg-white/60">
          <h3 className="text-2xl font-headline font-bold text-brand-navy leading-none tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-gold/10 rounded-full transition-all text-brand-text/30 hover:text-brand-gold hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-10 py-10 bg-white/40">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.getElementById('modal-root'))
}

export default Modal
