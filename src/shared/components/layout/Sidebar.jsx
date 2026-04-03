import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Landmark, 
  CalendarDays, 
  Coins, 
  History, 
  BadgeIndianRupee, 
  Gavel, 
  UserCircle,
  LogOut,
  ChevronRight,
  X,
  AlertTriangle,
  BarChart3,
  Bell,
  Settings
} from 'lucide-react'
import { useAuth } from '../../../core/providers/AuthProvider'
import { motion } from 'framer-motion'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chits', label: 'Chit Groups', icon: Coins },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/members/applications', label: 'Applications', icon: UserPlus },
  { path: '/payments', label: 'Payments', icon: BadgeIndianRupee },
  { path: '/auctions', label: 'Auctions', icon: Gavel },
  { path: '/ledger', label: 'Ledger', icon: History },
  { path: '/risk', label: 'Risk & Defaulters', icon: AlertTriangle },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin', label: 'Admin Controls', icon: Settings },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user: profile, logout: signOut } = useAuth()
  const navigate = useNavigate()

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  }

  return (
    <motion.aside 
      initial={false}
      animate={isOpen ? 'open' : (window.innerWidth >= 1024 ? 'open' : 'closed')}
      variants={sidebarVariants}
      className="h-screen w-64 fixed left-0 top-0 border-r border-[rgba(25,25,46,0.05)] bg-[rgba(255,255,255,1)] shadow-xl flex flex-col z-50 transition-all duration-300 lg:translate-x-0"
    >
      <div className="flex flex-col py-8 flex-1 overflow-y-auto no-scrollbar">
        {/* Logo Section */}
        <div className="px-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 heritage-gradient rounded-full flex items-center justify-center shadow-lg">
              <Landmark className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-brand-gold font-headline leading-none">
                SreemNidhi
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6458] font-bold mt-1 font-body opacity-70">
                Admin Portal
              </p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-[#6B6458] hover:text-brand-gold transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/members' || item.path === '/'}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'text-brand-gold font-bold bg-[#F7F5F0] shadow-sm border-r-4 border-brand-gold' 
                  : 'text-[#6B6458] font-medium hover:text-brand-gold hover:bg-[#F7F5F0]/50'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-headline tracking-tight">{item.label}</span>
              <ChevronRight className="ml-auto w-4 h-4 opacity-0 transition-all duration-200 group-hover:opacity-40" />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Admin Profile Section */}
      <div className="bg-[#F7F5F0]/30 border-t border-[rgba(25,25,46,0.05)] p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div 
            onClick={() => navigate('/profile')}
            className="flex flex-1 items-center gap-3 cursor-pointer group hover:bg-[#F7F5F0]/50 p-2 -ml-2 rounded-xl transition-all min-w-0"
          >
            <div className="w-10 h-10 rounded-full border-2 border-brand-gold/40 flex items-center justify-center bg-white overflow-hidden shrink-0 group-hover:border-brand-gold transition-colors">
              {profile?.full_name ? (
                <span className="text-brand-gold font-bold text-sm">
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              ) : (
                <UserCircle className="text-brand-gold w-full h-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline tracking-tight text-[#1A1A2E] leading-tight font-bold truncate group-hover:text-brand-gold transition-colors">
                {profile?.full_name || 'Administrator'}
              </p>
              <p className="text-[10px] text-[#6B6458] uppercase font-bold tracking-widest opacity-70 font-body">
                {profile?.role_type || 'Master Admin'}
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              signOut()
            }}
            className="text-[#6B6458]/40 hover:text-red-500 transition-colors p-1"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
