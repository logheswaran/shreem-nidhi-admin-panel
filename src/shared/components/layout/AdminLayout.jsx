import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Breadcrumbs from './Breadcrumbs'
import PageTransition from '../feedback/PageTransition'
import CommandPalette, { useCommandPalette } from '../ui/CommandPalette'
import ActionModal from '../../../features/dashboard/components/ActionModal'
import { useDashboardActions } from '../../../features/dashboard/hooks'
import { AnimatePresence, motion } from 'framer-motion'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isOpen: isCommandOpen, setIsOpen: setIsCommandOpen } = useCommandPalette()
  const location = useLocation()
  
  // Dashboard Action Hooks for the global modal
  const { mutate: mutateAction, isPending: actionPending } = useDashboardActions()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="h-screen bg-brand-ivory flex overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-[#2B2620]/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        mutateAction={mutateAction}
        isPending={actionPending}
      />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 lg:ml-64 relative">
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearchClick={() => setIsCommandOpen(true)} 
          onNewActionClick={() => setIsModalOpen(true)}
        />
        <main className="pt-24 px-4 md:px-8 pb-12 min-h-full">
          <div className="max-w-[1400px] mx-auto">
            <Breadcrumbs />
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
