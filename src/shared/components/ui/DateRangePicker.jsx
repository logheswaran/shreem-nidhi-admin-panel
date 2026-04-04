import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay } from 'date-fns'

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDayClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      onChange(day, null)
    } else {
      if (day < startDate) {
        onChange(day, null)
      } else {
        onChange(startDate, day)
        setIsOpen(false)
      }
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-[#1A1A1A] border-[0.5px] border-brand-gold/20 rounded-full shadow-sm hover:border-brand-gold/40 transition-all font-body text-[13px] text-[#2B2620] dark:text-[#F0EDD4]"
      >
        <Calendar className="w-4 h-4 text-[#BA7517]" />
        <div className="flex items-center gap-2">
          <span>{startDate ? format(startDate, 'dd MMM yyyy') : 'Start Date'}</span>
          <ArrowRight className="w-3 h-3 opacity-30" />
          <span>{endDate ? format(endDate, 'dd MMM yyyy') : 'End Date'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-4 left-0 z-50 bg-white dark:bg-[#1A1A1A] border border-brand-gold/10 rounded-3xl shadow-2xl p-6 min-w-[320px] animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-brand-gold/5 rounded-full text-brand-gold">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h4 className="font-headline font-bold text-[#2B2620] dark:text-[#F0EDD4] uppercase tracking-widest text-[11px]">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-brand-gold/5 rounded-full text-brand-gold">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-brand-text/30 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset for first day of month */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {days.map((day) => {
              const isSelected = isSameDay(day, startDate) || isSameDay(day, endDate)
              const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate })
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDayClick(startOfDay(day))}
                  className={`
                    h-10 w-10 text-[11px] rounded-full flex items-center justify-center transition-all
                    ${isSelected ? 'bg-[#BA7517] text-white font-bold shadow-lg shadow-brand-gold/20' : ''}
                    ${isInRange && !isSelected ? 'bg-[rgba(186,117,23,0.25)] text-[#BA7517] font-semibold' : ''}
                    ${!isSelected && !isInRange ? 'hover:bg-brand-gold/5 text-[#2B2620] dark:text-[#F0EDD4]/60' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-brand-gold/5 flex justify-end gap-3">
             <button onClick={() => { onChange(null, null); setIsOpen(false); }} className="px-4 py-2 text-[10px] font-black uppercase text-brand-text/40 hover:text-red-500">Reset</button>
             <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-[#BA7517] text-white text-[10px] font-black uppercase rounded-full">Apply</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
