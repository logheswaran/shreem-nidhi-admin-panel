import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, Coins, CalendarDays, History, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const quickLinks = [
  { id: 'dash', label: 'Go to Dashboard', path: '/', icon: <History className="w-4 h-4" /> },
  { id: 'members', label: 'Members Directory', path: '/members', icon: <User className="w-4 h-4" /> },
  { id: 'chits', label: 'Manage Chits', path: '/chits', icon: <Coins className="w-4 h-4" /> },
  { id: 'ops', label: 'Monthly Operations', path: '/operations', icon: <CalendarDays className="w-4 h-4" /> },
]

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, setIsOpen }
}

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  const filteredLinks = quickLinks.filter(link => 
    link.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2B2620]/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15vh] left-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-gold/20 z-[101] overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="p-4 border-b border-brand-gold/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-gold" />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search command or navigate... (e.g., 'members')"
                className="flex-1 bg-transparent border-none focus:ring-0 text-base font-body text-[#2B2620] placeholder:text-brand-text/30 outline-none"
              />
              <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-gold/10 text-brand-text/40 hover:text-brand-gold transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-2">
              {query && (
                <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-brand-text/30">
                  Search Results
                </div>
              )}
              
              {!query && (
                <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-brand-text/30">
                  Quick Actions
                </div>
              )}

              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleSelect(link.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-brand-gold/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 text-brand-gold" />
                      <span className="font-headline font-bold text-sm text-[#2B2620]">{link.label}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-brand-text/40 font-body text-sm italic">
                  No commands found matching "{query}"
                </div>
              )}
            </div>
            <div className="p-4 border-t border-brand-gold/5 bg-brand-ivory/50 flex items-center justify-between text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">
              <div className="flex gap-4">
                <span>Use <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-brand-gold/10 font-mono text-[#2B2620]">↑</kbd> <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-brand-gold/10 font-mono text-[#2B2620]">↓</kbd> to navigate</span>
                <span><kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-brand-gold/10 font-mono text-[#2B2620]">ESC</kbd> to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
