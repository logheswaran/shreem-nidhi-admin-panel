import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * COMPONENT: Premium Dropdown (Global System)
 * Standardized ivory glassmorphism dropdown for high-prestige admin UI.
 */
const PremiumDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select Option",
  label,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl p-4 text-left text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 transition-all shadow-inner flex items-center justify-between group ${isOpen ? 'border-brand-gold/40 ring-4 ring-brand-gold/5' : ''}`}
        >
          <span className={!selectedOption ? "text-[#2B2620]/30" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-brand-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-[100] top-full left-0 right-0 mt-3 bg-[#FFFAF5]/80 backdrop-blur-xl border border-brand-gold/10 rounded-[1.25rem] shadow-2xl overflow-hidden p-2 origin-top"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-[11px] font-bold rounded-xl transition-all duration-200 flex items-center justify-between group
                      ${value === option.value 
                        ? 'bg-brand-gold text-white shadow-md' 
                        : 'text-[#2B2620]/70 hover:bg-gradient-to-r hover:from-brand-gold/5 hover:to-brand-gold/10 hover:text-brand-gold hover:shadow-sm'
                      }`}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PremiumDropdown
