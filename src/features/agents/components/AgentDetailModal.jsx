import React from 'react'
import { Phone, Calendar, ArrowUpRight, Wallet, Users, Clock, ShieldCheck, AlertCircle } from 'lucide-react'
import GlobalModal from '../../../shared/components/ui/GlobalModal'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import DataTable from '../../../shared/components/ui/DataTable'
import { useAgentDetails } from '../hooks'

const AgentDetailModal = ({ isOpen, onClose, agent, onStatusChange, isUpdatingStatus }) => {
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ')
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('')
  }

  if (!agent) return null

  // Fetch referrals and commissions using hooks
  const { referrals, commissions, loading } = useAgentDetails(agent.id)

  const referredColumns = [
    {
      header: 'Member Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FAEEDA] flex items-center justify-center text-[#633806] font-bold text-xs">
            {getInitials(row.member_name)}
          </div>
          <span className="font-bold text-[#2B2620]">{row.member_name}</span>
        </div>
      )
    },
    {
      header: 'Mobile',
      render: (row) => <span className="font-medium text-brand-text/75">{row.mobile_number}</span>
    },
    {
      header: 'Chit Scheme',
      render: (row) => <span className="font-bold text-brand-goldDark">{row.chit_name}</span>
    },
    {
      header: 'Commission Paid',
      render: (row) => {
        if (!row.has_commission) {
          return (
            <span className="px-2 py-1 rounded-full text-[8px] font-black tracking-wider uppercase bg-gray-100 text-gray-500 border border-gray-200">
              No Commission
            </span>
          )
        }
        const isTraditional = row.commission_type?.toLowerCase() === 'traditional'
        return (
          <span className={`px-2 py-1 rounded-full text-[8px] font-black tracking-wider uppercase border ${
            isTraditional 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' 
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {isTraditional ? 'Traditional Paid' : 'Random Paid'}
          </span>
        )
      }
    },
    {
      header: 'Referred Date',
      render: (row) => (
        <span className="text-[10px] text-brand-text/50 font-bold">
          {new Date(row.referred_at).toLocaleDateString()}
        </span>
      )
    }
  ]

  const commissionColumns = [
    {
      header: 'Chit Scheme',
      render: (row) => <span className="font-bold text-[#2B2620]">{row.chit_name}</span>
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="capitalize text-[10px] font-medium text-brand-text/60">
          {row.commission_type}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="font-headline font-bold text-emerald-600">
          + ₹{Number(row.commission_amount).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-[10px] text-brand-text/50 font-bold">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    }
  ]

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Agent Intelligence Overview" maxWidth="max-w-6xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 mb-8 border-b border-brand-gold/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full heritage-gradient flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-brand-gold/10 shrink-0">
            {getInitials(agent.full_name)}
          </div>
          <div>
            <h3 className="text-2xl font-headline font-bold text-[#2B2620] leading-none mb-1">{agent.full_name}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2B2620]/60">
                <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" strokeWidth={2.5} /> {agent.mobile_number}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-gold/30"></span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2B2620]/60">
                <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" /> Joined {new Date(agent.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Badges + Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40 leading-none">KYC Integrity</span>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border ${
              agent.kyc_verified 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {agent.kyc_verified ? 'KYC Verified' : 'KYC Pending'}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#2B2620]/40 leading-none">Affiliate Status</span>
            <StatusBadge status={agent.status} size="sm" />
          </div>

          {/* Mutation Action Button */}
          <div className="ml-2 flex items-center">
            {agent.status === 'pending' && (
              <button
                onClick={() => onStatusChange(agent.id, 'active')}
                disabled={isUpdatingStatus}
                className="heritage-gradient px-5 py-2.5 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-50 active:scale-95"
              >
                Approve Agent
              </button>
            )}
            {agent.status === 'active' && (
              <button
                onClick={() => onStatusChange(agent.id, 'suspended')}
                disabled={isUpdatingStatus}
                className="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 active:scale-95"
              >
                Suspend Agent
              </button>
            )}
            {agent.status === 'suspended' && (
              <button
                onClick={() => onStatusChange(agent.id, 'active')}
                disabled={isUpdatingStatus}
                className="bg-green-50 text-green-700 border border-green-200 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-green-600 hover:text-white transition-all disabled:opacity-50 active:scale-95"
              >
                Reactivate Agent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-gold/5 p-6 rounded-[2rem] border border-brand-gold/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-brand-gold/10 text-brand-goldDark shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-0.5">Total Commission Earned</p>
            <p className="text-2xl font-headline font-bold text-[#2B2620]">₹{Number(agent.total_commission).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-gold/10 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-brand-gold/5 text-brand-goldDark shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-0.5">Total Referred Members</p>
            <p className="text-2xl font-headline font-bold text-[#2B2620]">{agent.total_referrals}</p>
          </div>
        </div>

        <div className="bg-brand-ivory/50 p-6 rounded-[2rem] border border-brand-gold/10 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-brand-gold/5 text-brand-goldDark shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text/60 mb-0.5">Affiliate Network ID</p>
            <p className="text-sm font-mono font-bold text-brand-goldDark">AGN-{agent.id.toUpperCase().slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Main Details Tables */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referred Members */}
          <div className="bg-white rounded-[2rem] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-brand-gold/5 bg-[#FDFCF7]/60">
              <h4 className="font-headline text-lg font-bold text-[#2B2620]">Referred Members</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30 mt-0.5">Client network introduced by agent</p>
            </div>
            <div className="overflow-x-auto">
              <DataTable columns={referredColumns} data={referrals} loading={false} />
            </div>
            {referrals.length === 0 && (
              <div className="text-center py-10 bg-white">
                <Users className="w-8 h-8 text-brand-gold/20 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#2B2620]/30 uppercase tracking-[0.15em]">No referred members yet.</p>
              </div>
            )}
          </div>

          {/* Commission History */}
          <div className="bg-white rounded-[2rem] border border-brand-gold/10 overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-brand-gold/5 bg-[#FDFCF7]/60">
              <h4 className="font-headline text-lg font-bold text-[#2B2620]">Commission History</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-text/30 mt-0.5">Chronological pay-out logic events</p>
            </div>
            <div className="overflow-x-auto">
              <DataTable columns={commissionColumns} data={commissions} loading={false} />
            </div>
            {commissions.length === 0 && (
              <div className="text-center py-10 bg-white">
                <Wallet className="w-8 h-8 text-brand-gold/20 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#2B2620]/30 uppercase tracking-[0.15em]">No commissions logged.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </GlobalModal>
  )
}

export default AgentDetailModal
