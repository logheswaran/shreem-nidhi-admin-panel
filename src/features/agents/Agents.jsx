import React, { useState, useMemo } from 'react'
import { 
  Users, Search, Wallet, Activity, Clock, ShieldCheck, AlertCircle, 
  Eye, UserCheck, UserX, Sparkles, Percent, Plus, Trash2
} from 'lucide-react'
import { useAgents, useCommissionLog } from './hooks'
import { useChits } from '../chits/hooks'
import DataTable from '../../shared/components/ui/DataTable'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import PremiumDropdown from '../../shared/components/ui/PremiumDropdown'
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog'
import Modal from '../../shared/components/ui/Modal'
import AgentDetailModal from './components/AgentDetailModal'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { adminService } from '../admin/api'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const Agents = () => {
  const [activeSubTab, setActiveSubTab] = useState('registry')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [registryStatusFilter, setRegistryStatusFilter] = useState('all')
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all')
  const [selectedChitFilter, setSelectedChitFilter] = useState('all')
  const [selectedCommTypeFilter, setSelectedCommTypeFilter] = useState('all')

  // Modal state
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollProfileId, setEnrollProfileId] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Data
  const { agents, loading: agentsLoading, updateStatus, createAgent, deleteAgent, isUpdatingStatus, isCreating, isDeleting } = useAgents()
  const { commissionLog, loading: commissionsLoading } = useCommissionLog()
  const { data: chits = [] } = useChits('all')

  // Profiles for enroll dropdown
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profiles-list'],
    queryFn: adminService.getProfiles,
    staleTime: 1000 * 60 * 5,
  })

  // Filter out profiles already registered as agents
  const agentProfileIds = useMemo(() => new Set(agents.map(a => a.profile_id)), [agents])
  const enrollableProfiles = useMemo(() =>
    allProfiles.filter(p => !agentProfileIds.has(p.id) && p.role_type !== 'admin'),
    [allProfiles, agentProfileIds]
  )

  const loading = agentsLoading || commissionsLoading

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const name = agent.full_name?.toLowerCase() || ''
      const mobile = agent.mobile_number || ''
      const search = debouncedSearch.toLowerCase()
      if (search && !name.includes(search) && !mobile.includes(search)) return false
      if (registryStatusFilter !== 'all' && agent.status !== registryStatusFilter) return false
      return true
    })
  }, [agents, debouncedSearch, registryStatusFilter])

  const registryStats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    pending: agents.filter(a => a.status === 'pending').length,
    totalReferrals: agents.reduce((sum, a) => sum + (a.total_referrals || 0), 0),
    totalCommission: agents.reduce((sum, a) => sum + (a.total_commission || 0), 0),
  }), [agents])

  const filteredCommissions = useMemo(() => {
    return commissionLog.filter(log => {
      if (selectedAgentFilter !== 'all' && log.agent_id !== selectedAgentFilter) return false
      if (selectedChitFilter !== 'all' && log.chit_id !== selectedChitFilter) return false
      if (selectedCommTypeFilter !== 'all' && log.commission_type !== selectedCommTypeFilter) return false
      const search = debouncedSearch.toLowerCase()
      if (search) {
        const a = log.agent_name?.toLowerCase() || ''
        const m = log.member_name?.toLowerCase() || ''
        const c = log.chit_name?.toLowerCase() || ''
        if (!a.includes(search) && !m.includes(search) && !c.includes(search)) return false
      }
      return true
    })
  }, [commissionLog, selectedAgentFilter, selectedChitFilter, selectedCommTypeFilter, debouncedSearch])

  const commissionsStats = useMemo(() => ({
    totalEvents: filteredCommissions.length,
    totalPaid: filteredCommissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0),
    traditionalCount: filteredCommissions.filter(c => c.commission_type === 'traditional').length,
    randomCount: filteredCommissions.filter(c => c.commission_type === 'random').length,
  }), [filteredCommissions])

  const handleEnroll = async () => {
    if (!enrollProfileId) return toast.error('Please select a profile')
    try {
      await createAgent(enrollProfileId)
      setShowEnrollModal(false)
      setEnrollProfileId('')
    } catch (_) {}
  }

  const handleDelete = async () => {
    try {
      await deleteAgent(deleteTargetId)
      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
    } catch (_) {}
  }

  const agentColumns = [
    {
      header: 'Agent Identity',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAEEDA] flex items-center justify-center text-[#633806] font-bold text-xs shadow-sm">
            {row.full_name?.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('') || '?'}
          </div>
          <div>
            <p className="font-bold text-[#2B2620] leading-none mb-0.5">{row.full_name}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30">ID: {row.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      )
    },
    { header: 'Mobile', render: (row) => <span className="font-medium text-brand-text/75">{row.mobile_number}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} size="sm" /> },
    {
      header: 'KYC',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-wider uppercase border ${
          row.kyc_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>
          {row.kyc_verified ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      header: 'Referrals',
      render: (row) => <span className="font-bold text-[#2B2620]">{row.total_referrals}</span>
    },
    {
      header: 'Commission',
      render: (row) => <span className="font-headline font-bold text-emerald-600">₹{Number(row.total_commission).toLocaleString()}</span>
    },
    {
      header: 'Joined',
      render: (row) => <span className="text-[10px] text-brand-text/50 font-bold">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedAgent(row)} className="p-1.5 hover:bg-[#FAEEDA]/50 text-[#BA7517] rounded-lg transition-all" title="View Profile">
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <button onClick={() => updateStatus(row.id, 'active')} disabled={isUpdatingStatus} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all disabled:opacity-50" title="Approve">
              <UserCheck className="w-4 h-4" />
            </button>
          )}
          {row.status === 'active' && (
            <button onClick={() => updateStatus(row.id, 'suspended')} disabled={isUpdatingStatus} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all disabled:opacity-50" title="Suspend">
              <UserX className="w-4 h-4" />
            </button>
          )}
          {row.status === 'suspended' && (
            <button onClick={() => updateStatus(row.id, 'active')} disabled={isUpdatingStatus} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all disabled:opacity-50" title="Reactivate">
              <UserCheck className="w-4 h-4" />
            </button>
          )}
          {/* Only show delete if no referrals */}
          {row.total_referrals === 0 && (
            <button
              onClick={() => { setDeleteTargetId(row.id); setShowDeleteConfirm(true) }}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-all disabled:opacity-50"
              title="Remove Agent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  const commissionColumns = [
    { header: 'Agent', render: (row) => <span className="font-bold text-[#2B2620]">{row.agent_name}</span> },
    { header: 'Referred Member', render: (row) => <span className="font-medium text-brand-text/75">{row.member_name}</span> },
    { header: 'Chit Scheme', render: (row) => <span className="font-bold text-brand-goldDark">{row.chit_name}</span> },
    {
      header: 'Type',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-wider uppercase border ${
          row.commission_type === 'traditional' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>{row.commission_type}</span>
      )
    },
    { header: 'Amount', render: (row) => <span className="font-headline font-bold text-emerald-600">₹{Number(row.commission_amount).toLocaleString()}</span> },
    { header: 'Date', render: (row) => <span className="text-[10px] text-brand-text/50 font-bold">{new Date(row.created_at).toLocaleDateString()}</span> }
  ]

  const agentOptions = useMemo(() => [
    { value: 'all', label: 'All Agents' },
    ...agents.map(a => ({ value: a.id, label: a.full_name }))
  ], [agents])

  const chitOptions = useMemo(() => [
    { value: 'all', label: 'All Chits' },
    ...chits.map(c => ({ value: c.id, label: c.name }))
  ], [chits])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Percent className="w-5 h-5 text-brand-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Affiliate Vault</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-[#2B2620]">Affiliates & Commissions</h2>
          <p className="text-on-surface-variant font-body mt-2 opacity-70">Monitor referral loops, approve affiliate status, and manage commission payouts.</p>
        </div>
        {activeSubTab === 'registry' && (
          <button
            onClick={() => setShowEnrollModal(true)}
            className="heritage-gradient px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-3 shadow-xl hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Enroll Agent
          </button>
        )}
      </header>

      {/* Stats */}
      {activeSubTab === 'registry' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          {[
            { label: 'Total Agents', value: registryStats.total, icon: Users, style: '' },
            { label: 'Active', value: registryStats.active, icon: ShieldCheck, style: 'border-b-4 border-b-green-500/30', iconBg: 'bg-green-50/50 text-green-600' },
            { label: 'Pending Approval', value: registryStats.pending, icon: Clock, style: 'border-b-4 border-b-amber-500/30', iconBg: 'bg-amber-50 text-amber-600', valStyle: 'text-amber-600' },
            { label: 'Total Referrals', value: registryStats.totalReferrals, icon: UserCheck, style: '' },
            { label: 'Commissions Paid', value: `₹${registryStats.totalCommission.toLocaleString()}`, icon: Wallet, style: 'heritage-gradient text-white', iconBg: 'bg-white/10 text-white', labelStyle: 'text-white/60', valStyle: 'text-white' },
          ].map(({ label, value, icon: Icon, style, iconBg = 'bg-brand-gold/10 text-brand-gold', labelStyle = 'text-brand-text/60', valStyle = 'text-[#2B2620]' }, i) => (
            <div key={i} className={`bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4 ${style}`}>
              <div className={`p-4 rounded-full shrink-0 ${iconBg}`}><Icon className="w-6 h-6" /></div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${labelStyle}`}>{label}</p>
                <p className={`text-2xl font-headline font-bold ${valStyle}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold shrink-0"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Total Events</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{commissionsStats.totalEvents}</p>
            </div>
          </div>
          <div className="heritage-gradient p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-4">
            <div className="p-4 rounded-full bg-white/10 shrink-0"><Wallet className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Cumulative Amount</p>
              <p className="text-2xl font-headline font-bold">₹{commissionsStats.totalPaid.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm border-b-4 border-b-green-500/30 flex items-center gap-4">
            <div className="p-4 rounded-full bg-green-50/50 text-green-600 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Traditional</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{commissionsStats.traditionalCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm border-b-4 border-b-amber-500/30 flex items-center gap-4">
            <div className="p-4 rounded-full bg-[#FAEEDA] text-[#BA7517] shrink-0"><Sparkles className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-1">Random</p>
              <p className="text-2xl font-headline font-bold text-[#2B2620]">{commissionsStats.randomCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white border border-brand-gold/10 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
        {/* Sub-tabs */}
        <div className="px-8 flex border-b border-brand-gold/5 bg-gray-50/20">
          {['registry', 'commissions'].map(tab => (
            <button key={tab} onClick={() => { setActiveSubTab(tab); setSearchTerm('') }}
              className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSubTab === tab ? 'text-brand-gold' : 'text-brand-text/30 hover:text-[#2B2620]'}`}
            >
              {tab === 'registry' ? 'Agent Registry' : 'Commission Log'}
              {activeSubTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-gold rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-brand-gold/5 flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-[#FDFCF7]/30">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-text/20 group-focus-within:text-brand-gold transition-colors w-4 h-4" />
            <input
              className="w-full bg-white border border-brand-gold/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-body focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/20 focus:outline-none transition-all placeholder:text-brand-text/20 shadow-sm"
              placeholder={activeSubTab === 'registry' ? 'Search Agent Name or Mobile...' : 'Search Agent, Member or Scheme...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {activeSubTab === 'registry' ? (
              <PremiumDropdown className="min-w-[180px]" value={registryStatusFilter} onChange={setRegistryStatusFilter}
                options={[{ value: 'all', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]}
              />
            ) : (
              <>
                <PremiumDropdown className="min-w-[160px]" value={selectedAgentFilter} onChange={setSelectedAgentFilter} options={agentOptions} />
                <PremiumDropdown className="min-w-[160px]" value={selectedChitFilter} onChange={setSelectedChitFilter} options={chitOptions} />
                <PremiumDropdown className="min-w-[160px]" value={selectedCommTypeFilter} onChange={setSelectedCommTypeFilter}
                  options={[{ value: 'all', label: 'All Types' }, { value: 'traditional', label: 'Traditional' }, { value: 'random', label: 'Random' }]}
                />
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="p-0">
          {activeSubTab === 'registry' ? (
            <DataTable columns={agentColumns} data={filteredAgents} loading={loading}
              onRowClick={row => setSelectedAgent(row)}
              rowClassName="hover:bg-brand-ivory/30 cursor-pointer transition-all border-b border-brand-gold/5"
            />
          ) : (
            <DataTable columns={commissionColumns} data={filteredCommissions} loading={loading} />
          )}

          {!loading && (activeSubTab === 'registry' ? filteredAgents.length === 0 : filteredCommissions.length === 0) && (
            <div className="text-center py-20 bg-white">
              <AlertCircle className="w-12 h-12 text-brand-gold/20 mx-auto mb-4" />
              <p className="text-sm font-bold text-[#2B2620]/30 uppercase tracking-[0.2em]">
                {activeSubTab === 'registry' ? 'No Agents found in this network' : 'No commission records found'}
              </p>
              {activeSubTab === 'registry' && (
                <button onClick={() => setShowEnrollModal(true)} className="mt-6 heritage-gradient px-6 py-2.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg hover:brightness-110 transition-all">
                  Enroll First Agent
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agent={selectedAgent}
        onStatusChange={(id, status) => {
          updateStatus(id, status).then(updated => {
            if (updated) setSelectedAgent(prev => ({ ...prev, status: updated.status }))
          }).catch(() => {})
        }}
        isUpdatingStatus={isUpdatingStatus}
      />

      {/* Enroll Agent Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => { setShowEnrollModal(false); setEnrollProfileId('') }} title="Enroll New Agent">
        <div className="space-y-6">
          <div className="p-5 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
            <p className="text-xs text-[#2B2620]/60 font-bold leading-relaxed">
              Select an existing profile to register as an affiliate agent. The agent will start in <strong>Pending</strong> status and must be approved before they can be active.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/80 mb-3 block">Select Profile</label>
            <select
              value={enrollProfileId}
              onChange={e => setEnrollProfileId(e.target.value)}
              className="w-full bg-[#FDFCF7] border border-brand-gold/10 rounded-2xl p-4 text-sm font-bold text-[#2B2620] focus:outline-none focus:border-brand-gold/40 transition-all"
            >
              <option value="">— Choose a profile —</option>
              {enrollableProfiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {p.mobile_number ? `(${p.mobile_number})` : ''}
                </option>
              ))}
            </select>
            {enrollableProfiles.length === 0 && (
              <p className="text-[10px] text-brand-text/40 font-bold mt-2 text-center">All profiles are already registered as agents.</p>
            )}
          </div>

          <button
            onClick={handleEnroll}
            disabled={isCreating || !enrollProfileId}
            className="w-full heritage-gradient py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isCreating ? 'Enrolling...' : 'Enroll as Agent'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null) }}
        onConfirm={handleDelete}
        title="Remove Agent?"
        description="This will permanently remove this agent from the registry. This is only allowed for agents with no referrals."
        intent="danger"
      />
    </div>
  )
}

export default Agents
