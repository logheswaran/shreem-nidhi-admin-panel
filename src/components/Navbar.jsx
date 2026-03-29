import React from 'react'
import { Search, Bell, Settings, PlusCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const { profile } = useAuth()

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-brand-gold/10 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex items-center bg-surface-container/50 px-4 py-2 rounded-full w-96 border border-brand-gold/5 focus-within:border-brand-gold/30 transition-all">
        <Search className="text-brand-text/40 w-4 h-4 mr-2" />
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-brand-text/30"
          placeholder="Search members, transactions or chits..."
          type="text"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-brand-text/60 hover:text-brand-gold transition-colors p-2 rounded-full hover:bg-brand-gold/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <button className="text-brand-text/60 hover:text-brand-gold transition-colors p-2 rounded-full hover:bg-brand-gold/5">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-brand-gold/20 mx-2"></div>

        <button className="heritage-gradient text-white px-5 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all font-body">
          <PlusCircle className="w-4 h-4" />
          New Transaction
        </button>
      </div>
    </header>
  )
}

export default Navbar
