import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * GLOBAL MODAL SYSTEM (Standardized)
 * 🌫 Glassmorphism Backdrop (16px blur)
 * 🧱 Heritage Ivory Container (#FDF6EE)
 * ⚡ Snappy Entrance/Exit (200ms)
 */
const GlobalModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-2xl',
  showClose = true
}) => {
  
  // ESC key handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* 🌫 HERITAGE GLASS OVERLAY: No black/dark tints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#FFF8F0]/55 backdrop-blur-[16px]"
            onClick={onClose}
          />
          
          {/* 🧱 MODAL CONTAINER: Heritage Ivory (#FDF6EE) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.8 }}
            className={`relative w-full ${maxWidth} bg-[#FDF6EE] rounded-[20px] shadow-[0_20px_50px_rgba(182,149,94,0.15)] border border-[#B6955E]/10 overflow-hidden flex flex-col z-50`}
          >
            {/* Header Area */}
            {(title || showClose) && (
              <div className="px-8 py-6 flex items-center justify-between border-b border-[#B6955E]/5 bg-white/40">
                {title ? (
                  <h3 className="text-xl font-headline font-bold text-[#2B2620] tracking-tight">
                    {title}
                  </h3>
                ) : <div />}
                
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-brand-gold/10 text-[#2B2620]/30 hover:text-brand-gold transition-all active:scale-90"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content Area: Scrolling if content exceeds viewport */}
            <div className="flex-1 overflow-y-auto max-h-[85vh] px-8 py-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root')
  )
}

export default GlobalModal
