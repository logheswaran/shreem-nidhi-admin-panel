import React from 'react'
import { Search, Bell, Settings, PlusCircle, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../../core/providers/AuthProvider'
import { useTheme } from '../../../core/providers/ThemeProvider'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuClick, onSearchClick, onNewActionClick }) => {
  const { profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-brand-gold/10 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-brand-navy hover:bg-brand-gold/5 rounded-full transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Trigger (Ctrl+K) */}
        <button 
          onClick={onSearchClick}
          className="hidden md:flex items-center justify-between bg-surface-container/50 px-4 py-2 rounded-full w-96 border border-brand-gold/5 hover:border-brand-gold/30 hover:bg-surface-container transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="text-brand-text/40 w-4 h-4 group-hover:text-brand-gold transition-colors" />
            <span className="text-sm font-body text-brand-text/40 group-hover:text-brand-navy transition-colors">
              Search registry or jump to...
            </span>
          </div>
          <kbd className="hidden lg:inline-block px-2 text-[10px] font-bold font-mono text-brand-text/30 bg-white border border-brand-gold/10 rounded-md shadow-sm">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative text-brand-text/60 hover:text-brand-gold transition-colors p-2 rounded-full hover:bg-brand-gold/5"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="relative p-2 rounded-full hover:bg-brand-gold/5 transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="relative w-5 h-5">
            <Sun className={`w-5 h-5 absolute inset-0 text-brand-gold transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
            <Moon className={`w-5 h-5 absolute inset-0 text-brand-gold transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
          </div>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className="hidden sm:block text-brand-text/60 hover:text-brand-gold transition-colors p-2 rounded-full hover:bg-brand-gold/5"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-brand-gold/20 mx-1 hidden sm:block"></div>

        <button 
          onClick={onNewActionClick}
          className="heritage-gradient text-white px-4 md:px-5 py-2 rounded-full text-[10px] md:text-sm font-bold shadow-md flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all font-body"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Action</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
