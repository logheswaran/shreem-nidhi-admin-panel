import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'

/**
 * COMPONENT: Premium Date Picker
 * Standardized ivory glassmorphism date input for high-prestige admin UI.
 */
const PremiumDatePicker = ({ value, onChange, label, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold/60 group-focus-within:text-brand-gold transition-colors z-10 pointer-events-none">
          <CalendarIcon className="w-full h-full" />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 focus:ring-4 focus:ring-brand-gold/5 transition-all shadow-inner appearance-none relative"
          style={{
            colorScheme: 'light'
          }}
        />
        {/* Custom arrow/indicator replacement for native picker if needed, 
            but native date picker is usually better for mobile/accessibility.
            We just style the container to match the 'Premium' look. */}
      </div>
      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          z-index: 20;
        }
      `}</style>
    </div>
  )
}

export default PremiumDatePicker
