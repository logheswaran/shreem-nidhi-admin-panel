import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Users,
  AlertCircle
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
  const { user, isAdmin } = useAuth()
  const { members, loading, addMember, editMember, removeMember } = useMembers()
  const searchRef = useRef(null)

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowAddModal(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

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

    // Tab Filter
    if (activeTab === 'active') {
      result = result.filter(m => m.status === 'active')
    } else if (activeTab === 'defaulters') {
      result = result.filter(m => m.status === 'defaulter')
    }

    // Sort Logic
    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortOrder === 'contribution') {
        const amtA = a.chits?.amount || 0
        const amtB = b.chits?.amount || 0
        return amtB - amtA
      }
      return 0
    })

    return result
  }, [members, debouncedSearch, activeTab, sortOrder])

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    defaulters: members.filter(m => m.status === 'defaulter').length
  }), [members])

  const columns = [
    {
      header: 'Member Identity',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full heritage-gradient flex items-center justify-center text-white font-black text-sm shadow-sm">
            {row.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-brand-navy leading-none mb-1">{row.profiles?.full_name || 'Anonymous'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Secure Contact',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-brand-text/60">{row.profiles?.mobile_number}</span>
          <span className="text-[10px] text-brand-text/30 truncate max-w-[150px]">{row.profiles?.email || 'no-email@sreemnidhi.com'}</span>
        </div>
      )
    },
    {
      header: 'Heritage Portfolio',
      render: (row) => (
        <div>
          <span className="text-xs font-bold text-brand-navy block lowercase">{row.chits?.name || 'Unassigned'}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60">
            {row.chits?.amount ? `₹${Number(row.chits.amount).toLocaleString()}` : '--'}
          </span>
        </div>
      )
    },
    { 
      header: 'Standing', 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedMember(row)}
            className="p-2 hover:bg-brand-gold/10 text-brand-gold transition-colors rounded-lg"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setEditingMember(row)}
            className="p-2 hover:bg-brand-gold/10 text-brand-gold transition-colors rounded-lg"
            title="Edit Record"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                setDeleteTargetId(row.id)
                setShowDeleteConfirm(true)
              }}
              className="p-2 hover:bg-red-50 text-red-500 transition-colors rounded-lg"
              title="Remove Member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => navigate(`/members/${row.id}`)}
            className="p-2 hover:bg-brand-gold/10 text-brand-navy transition-colors rounded-lg"
            title="Full Profile"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const handleCreateMember = async (data) => {
    try {
      await addMember(data)
      setShowAddModal(false)
    } catch (err) {
      // Error handled in hook
    }
  }

  const handleUpdateMember = async (data) => {
    try {
      await editMember(editingMember.id, data)
      setEditingMember(null)
    } catch (err) {
      // Error handled in hook
    }
  }

  const handleDeleteMember = async () => {
    try {
      await removeMember(deleteTargetId)
      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
    } catch (err) {
      // Error handled in hook
    }
  }

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
    exportToCSV(data, exportCols, 'SreemNidhi_Members_Registry')
    toast.success('Registry exported as CSV')
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-brand-gold/10 text-brand-goldDark text-[8px] font-black uppercase tracking-[0.2em] rounded-full">Secure Registry</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-brand-navy">Members Directory</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Unified management portal for all trust beneficiaries.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-6 py-3 bg-white text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 border border-brand-gold/10 hover:bg-brand-gold/5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Registry
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="heritage-gradient px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Enroll New Member
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Enrollment', value: stats.total, icon: Users, color: 'brand-gold' },
          { label: 'Active Standings', value: stats.active, icon: TrendingUp, color: 'green-600' },
          { label: 'Pending Arrears', value: stats.defaulters, icon: AlertCircle, color: 'red-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-brand-gold/5 flex items-center justify-between shadow-sm group hover:border-brand-gold/20 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/40 mb-1">{stat.label}</p>
              <p className="text-3xl font-headline font-bold text-brand-navy">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-white shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Tabs */}
        <div className="p-1 bg-brand-ivory rounded-2xl flex gap-1 self-start md:self-auto">
          {['all', 'active', 'defaulters'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-brand-navy shadow-sm' 
                  : 'text-brand-text/40 hover:text-brand-navy'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 justify-end w-full">
          {/* Search */}
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
            <input 
              ref={searchRef}
              className="w-full bg-white border-2 border-brand-gold/5 focus:border-brand-gold/30 rounded-2xl py-3 pl-12 pr-6 text-sm font-body focus:ring-0 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
              placeholder="Search (Ctrl+K)..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white border-2 border-brand-gold/5 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-gold/30 shadow-sm transition-all cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="contribution">Sort: High Contribution</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="soft-glow bg-white/20 rounded-[2.5rem] border border-brand-gold/5 overflow-hidden">
        <DataTable 
          columns={columns} 
          data={processedMembers} 
          loading={loading} 
          onRowClick={(row) => setSelectedMember(row)}
        />
      </div>

      {/* Modals */}
      <MemberFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateMember}
      />

      <MemberFormModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={handleUpdateMember}
        initialData={editingMember}
      />

      <MemberQuickViewModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onViewFull={(id) => {
          setSelectedMember(null)
          navigate(`/members/${id}`)
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteMember}
        title="Remove Member Permanently?"
        description="This will terminate the digital enrollment of this member across all heritage portfolios. This action is immutable."
        intent="danger"
      />
    </div>
  )
}

export default Members
