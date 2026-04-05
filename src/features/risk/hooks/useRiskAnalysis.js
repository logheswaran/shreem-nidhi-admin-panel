import { useMemo } from 'react'
import { useMembers } from '../../members/useMembers'
import { useLedger } from '../../finance/useLedger'
import { computeMemberRisk } from '../utils/riskEngine'

export const useRiskAnalysis = () => {
  const { members, loading: membersLoading } = useMembers()
  const { ledger, loading: ledgerLoading } = useLedger()

  const enriched = useMemo(() => {
    return members.map(member => {
      const risk = computeMemberRisk(member, ledger)

      return {
        ...member,
        risk,
        total_overdue_amount: risk.pending,
        overdue_count: risk.overdueMonths
      }
    })
  }, [members, ledger])

  const defaulters = enriched.filter(
    m => m.risk.level === 'HIGH'
  )

  return {
    all: enriched,
    defaulters,
    isLoading: membersLoading || ledgerLoading
  }
}
