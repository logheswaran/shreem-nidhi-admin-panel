import React, { useEffect } from 'react'
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-navy/30 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-brand-ivory w-full ${maxWidth} rounded-[3rem] shadow-2xl overflow-hidden border border-brand-gold/10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 my-auto`}>
        {/* Header */}
        <div className="px-10 py-8 border-b border-brand-gold/5 flex justify-between items-center bg-white/50">
          <h3 className="text-2xl font-headline font-bold text-brand-navy leading-none">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-gold/10 rounded-full transition-all text-brand-text/30 hover:text-brand-gold hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-10 py-10 bg-white/30 backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
