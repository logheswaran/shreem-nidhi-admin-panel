import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-brand-ivory">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Navbar />
        <main className="pt-20 px-8 pb-12 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
