import React, { useEffect, useState } from 'react'
import { Search, UserCircle, Phone, ArrowUpRight, Filter, Download, Mail, MoreVertical } from 'lucide-react'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { memberService } from '../services/memberService'
import toast from 'react-hot-toast'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const data = await memberService.getMembers()
        setMembers(data)
      } catch (error) {
        toast.error('Failed to load members directory')
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const filteredMembers = members.filter(m => 
    m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.profiles?.phone_number?.includes(searchTerm)
  )

  const columns = [
    { 
      header: 'Member Identity', 
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-brand-gold/5 flex items-center justify-center border border-brand-gold/10 overflow-hidden shadow-sm group-hover:bg-white transition-all">
            {row.profiles?.full_name ? (
              <span className="text-brand-gold font-black text-lg">{row.profiles.full_name[0]}</span>
            ) : (
              <UserCircle className="text-brand-gold/30 w-8 h-8" />
            )}
          </div>
          <div>
            <p className="font-headline font-bold text-brand-navy leading-none mb-1.5">{row.profiles?.full_name || 'Anonymous'}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Communication', 
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-xs font-bold text-brand-text/60"><Phone className="w-3.5 h-3.5 text-brand-gold/50" /> {row.profiles?.phone_number}</span>
          <span className="text-[10px] text-brand-text/30 font-medium lowercase italic">{row.profiles?.email || 'no-email@sreemnidhi.com'}</span>
        </div>
      )
    },
    { 
      header: 'Heritage Portfolio', 
      render: (row) => (
        <div>
          <span className="font-headline font-bold text-brand-navy block leading-none mb-1">{row.chits?.name || 'Unassigned'}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">Active Commitment</span>
        </div>
      )
    },
    { header: 'Standing', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Action', 
      render: () => (
        <button className="p-2 hover:bg-brand-gold/10 rounded-full transition-all text-brand-text/30 hover:text-brand-gold">
          <MoreVertical className="w-5 h-5" />
        </button>
      )
    }
  ]

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Members Directory</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">A comprehensive registry of SreemNidhi trust beneficiaries.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export Registry
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-brand-gold/5 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
          <input 
            className="w-full bg-white border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-full py-3.5 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20"
            placeholder="Search by name or phone..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-ivory rounded-full border border-brand-gold/10 transform hover:scale-105 transition-transform cursor-pointer">
            <Filter className="w-4 h-4 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60">Advanced Filter</span>
          </div>
          <div className="h-10 w-[1px] bg-brand-gold/20 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-6 px-4">
             <div className="flex flex-col items-center">
               <span className="text-sm font-bold text-brand-navy">{members.length}</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-brand-gold opacity-50">Total</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-sm font-bold text-green-600">{members.filter(m => m.status === 'active').length}</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-brand-gold opacity-50">Active</span>
             </div>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredMembers} 
        loading={loading} 
        onRowClick={(row) => toast(`Viewing profile for ${row.profiles?.full_name}`)}
      />
    </div>
  )
}

export default Members
