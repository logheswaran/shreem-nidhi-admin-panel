export const computeMemberRisk = (member, ledgerEntries) => {
  const memberLedger = ledgerEntries.filter(
    l => l.user_id === member.user_id
  )

  const totalPaid = memberLedger
    .filter(l => l.transaction_type === 'credit')
    .reduce((sum, l) => sum + Number(l.amount), 0)

  // Use normalized field names (monthly_amount)
  const monthlyAmount = member.chits?.monthly_amount || member.chits?.monthly_contribution || 0
  
  const totalExpected =
    monthlyAmount *
    getMonthsElapsed(member.joined_at)

  const pending = Math.max(0, totalExpected - totalPaid)

  const paidRatio =
    totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 100

  const overdueMonths =
    monthlyAmount > 0
      ? Math.floor(pending / monthlyAmount)
      : 0

  // 🚨 Risk Classification
  if (overdueMonths > 0 || paidRatio < 60 || member.status === 'defaulter') {
    return {
      level: 'HIGH',
      reason: `${overdueMonths} overdue months`,
      pending,
      overdueMonths,
      restricted: true
    }
  }

  if (paidRatio < 90) {
    return {
      level: 'MEDIUM',
      reason: `Payment consistency ${paidRatio.toFixed(0)}%`,
      pending,
      overdueMonths,
      restricted: false
    }
  }

  return {
    level: 'LOW',
    reason: 'Healthy account',
    pending,
    overdueMonths,
    restricted: false
  }
}

// helper
const getMonthsElapsed = (date) => {
  if (!date) return 0
  return Math.floor(
    (Date.now() - new Date(date).getTime()) /
    (1000 * 60 * 60 * 24 * 30)
  )
}
