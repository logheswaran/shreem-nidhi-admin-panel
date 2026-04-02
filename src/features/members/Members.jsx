import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Download, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Users as UsersIcon,
  Search,
  Wallet
} from 'lucide-react'
import { useMembers } from './useMembers'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { useAuth } from '../../core/providers/AuthProvider'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import MemberFormModal from './components/MemberFormModal'
import MemberQuickViewModal from './components/MemberQuickViewModal'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
import { exportToCSV } from '../../shared/utils/exportUtils'
import toast from 'react-hot-toast'

const Members = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { members, loading, addMember, editMember, removeMember } = useMembers()
  const searchRef = useRef(null)

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('All members') // Using name as key
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  // DYNAMIC TAB GENERATION
  const dynamicTabs = useMemo(() => {
    const chitNames = members
      .map(m => m.chits?.name)
      .filter(name => name && name !== 'Unassigned')
    return ['All members', ...new Set(chitNames)]
  }, [members])

  // Filter & Sort Logic
  const processedMembers = useMemo(() => {
    let result = [...members]

    // Search Filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      result = result.filter(m => 
        m.profiles?.full_name?.toLowerCase().includes(search) ||
        m.profiles?.mobile_number?.includes(search) ||
        m.id.toLowerCase().includes(search)
      )
    }

    // Tab Filter (by Chit Name)
    if (activeTab !== 'All members') {
      result = result.filter(m => m.chits?.name === activeTab)
    }

    return result
  }, [members, debouncedSearch, activeTab])

  // STATS CALCULATION
  const stats = useMemo(() => {
    if (activeTab === 'All members') {
      const uniqueChits = new Set(members.map(m => m.chits?.name).filter(Boolean)).size
      return {
        col1: { label: 'Total Enrollment', value: members.length },
        col2: { label: 'Active Standings', value: members.filter(m => m.status === 'active').length },
        col3: { label: 'Diversity Index', value: `${uniqueChits} Active Chits` }
      }
    } else {
      const chitMembers = members.filter(m => m.chits?.name === activeTab)
      const chitValue = chitMembers[0]?.chits?.monthly_amount || 0
      return {
        col1: { label: 'Members in Cluster', value: chitMembers.length },
        col2: { label: 'Active Participation', value: chitMembers.filter(m => m.status === 'active').length },
        col3: { label: 'Certificate Value', value: `₹${Number(chitValue).toLocaleString()}` }
      }
    }
  }, [members, activeTab])

  const columns = useMemo(() => {
    const baseColumns = [
      {
        header: 'Member Identity',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAEEDA] flex items-center justify-center text-[#633806] font-bold text-xs shadow-sm">
              {row.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-brand-navy leading-none mb-0.5">{row.profiles?.full_name || 'Anonymous'}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        )
      },
      {
        header: 'Secure Contact',
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-brand-text/60">{row.profiles?.mobile_number}</span>
            <span className="text-[10px] text-brand-text/30 truncate max-w-[150px]">{row.profiles?.email || 'no-email@sreemnidhi.com'}</span>
          </div>
        )
      }
    ]

    // Only add Heritage Portfolio if we are in "All members" tab
    if (activeTab === 'All members') {
      baseColumns.push({
        header: 'Heritage Portfolio',
        render: (row) => (
          <div>
            <span className="text-[11px] font-bold text-brand-navy block lowercase">{row.chits?.name || 'Unassigned'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#BA7517]/60">
              {row.chits?.monthly_amount ? `₹${Number(row.chits.monthly_amount).toLocaleString()}` : '--'}
            </span>
          </div>
        )
      })
    }

    baseColumns.push(
      { 
        header: 'Standing', 
        render: (row) => {
          const statusMap = {
            'active': { label: 'Active', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
            'won': { label: 'Won', bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' },
            'matured': { label: 'Matured', bg: 'bg-[#E6F1FB]', text: 'text-[#0C447C]' }
          }
          const s = statusMap[row.status] || { label: row.status, bg: 'bg-gray-50', text: 'text-gray-600' }
          return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[0.1em] uppercase ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          )
        }
      },
      {
        header: 'Actions',
        render: (row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedMember(row)} className="p-1.5 hover:bg-[#FAEEDA]/50 text-[#BA7517] transition-all rounded-lg"><Eye className="w-4 h-4" /></button>
            <button onClick={() => setEditingMember(row)} className="p-1.5 hover:bg-[#FAEEDA]/50 text-[#BA7517] transition-all rounded-lg"><Pencil className="w-4 h-4" /></button>
            {isAdmin && (
              <button 
                onClick={() => { setDeleteTargetId(row.id); setShowDeleteConfirm(true); }}
                className="p-1.5 hover:bg-red-50 text-red-500 transition-all rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => navigate(`/members/${row.id}`)} className="p-1.5 hover:bg-gray-50 text-gray-400 transition-all rounded-lg ml-1"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )
      }
    )

    return baseColumns
  }, [activeTab, isAdmin, navigate])

  const handleExport = () => {
    const exportCols = [
      { header: 'Full Name', accessor: 'profiles.full_name' },
      { header: 'Phone', accessor: 'profiles.mobile_number' },
      { header: 'Email', accessor: 'profiles.email' },
      { header: 'Chit', accessor: 'chits.name' },
      { header: 'Status', accessor: 'status' }
    ]
    const data = processedMembers.map(m => ({
      ...m,
      'profiles.full_name': m.profiles?.full_name,
      'profiles.mobile_number': m.profiles?.mobile_number,
      'profiles.email': m.profiles?.email,
      'chits.name': m.chits?.name || 'Unassigned'
    }))
    exportToCSV(data, exportCols, `SreemNidhi_${activeTab}_Registry`)
    toast.success('Registry exported as CSV')
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Members Directory</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Secured segregation and portfolio audit interface.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} className="px-6 py-3 bg-white text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm active:scale-95">
            <Download className="w-4 h-4" /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="heritage-gradient px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Enroll New Member
          </button>
        </div>
      </header>

      {/* SEARCH (Now elevated above the card) */}
      <div className="mb-8 relative group max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-[#BA7517] transition-colors w-4 h-4" />
        <input 
          ref={searchRef}
          className="w-full bg-white/50 backdrop-blur-sm border-2 border-brand-gold/5 focus:border-[#BA7517]/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
          placeholder="Global Registry Audit (Ctrl+K)..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Segregation Card */}
      <div className="bg-white border-[0.5px] border-brand-gold/20 rounded-[12px] shadow-sm overflow-hidden flex flex-col">
        {/* TAB BAR */}
        <div className="px-6 flex border-b border-brand-gold/10 overflow-x-auto no-scrollbar bg-gray-50/10">
          {dynamicTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap flex items-center gap-3 ${
                activeTab === tab 
                  ? 'text-[#BA7517]' 
                  : 'text-brand-text/30 hover:text-brand-navy'
              }`}
            >
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === tab ? 'bg-[#FAEEDA] text-[#633806]' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab === 'All members' ? members.length : members.filter(m => m.chits?.name === tab).length}
              </span>
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#BA7517]"></div>}
            </button>
          ))}
        </div>

        {/* STATS BAR (Inside Card) */}
        <div className="grid grid-cols-3 gap-0 p-1 border-b border-brand-gold/10">
           {[stats.col1, stats.col2, stats.col3].map((s, idx) => (
             <div key={idx} className={`p-8 hover:bg-gray-50/50 transition-all bg-transparent ${idx < 2 ? 'border-r border-brand-gold/5' : ''}`}>
                <p className="text-[11px] font-black uppercase tracking-widest text-brand-text/30 mb-2">{s.label}</p>
                <p className="text-xl font-headline font-medium text-brand-navy">{s.value}</p>
             </div>
           ))}
        </div>

        {/* TABLE SECTION */}
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={processedMembers} 
            loading={loading} 
            onRowClick={(row) => setSelectedMember(row)}
            // Custom CSS for table row hover states as requested
            rowClassName="hover:bg-gray-50 cursor-pointer transition-all"
          />
        </div>
      </div>

      {/* Modals */}
      <MemberFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addMember} />
      <MemberFormModal isOpen={!!editingMember} onClose={() => setEditingMember(null)} onSubmit={(data) => editMember(editingMember.id, data)} initialData={editingMember} />
      <MemberQuickViewModal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} member={selectedMember} onViewFull={(id) => { setSelectedMember(null); navigate(`/members/${id}`) }} />
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => removeMember(deleteTargetId).then(() => setShowDeleteConfirm(false))} title="Remove Member Permanently?" description="This action is immutable and will terminate the beneficiary record." intent="danger" />
    </div>
  )
}

export default Members
