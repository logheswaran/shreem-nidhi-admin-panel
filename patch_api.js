const fs = require('fs');
let code = fs.readFileSync('src/features/finance/api.js', 'utf8');

// Update select query
code = code.replace(
  ".select('chit_id, amount_due, amount_paid, payment_status')",
  ".select('chit_id, amount_due, amount_paid, payment_status, due_date, month_number')"
);

// Update map loop
const oldLoop = `        const chitConts = contributions.filter(c => c.chit_id === chit.id)
        const totalDue = chitConts.reduce((sum, c) => sum + Number(c.amount_due), 0)
        const totalPaid = chitConts.reduce((sum, c) => sum + (c.payment_status === 'paid' ? Number(c.amount_paid) : 0), 0)
        
        return {
          ...chit,
          totalDue,
          totalPaid,
          percentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 100
        }`;

const newLoop = `        const chitConts = contributions.filter(c => c.chit_id === chit.id && c.month_number === chit.current_month)
        const totalDue = chitConts.reduce((sum, c) => sum + Number(c.amount_due || 0), 0)
        const totalPaid = chitConts.reduce((sum, c) => sum + Number(c.amount_paid || 0), 0)
        
        const today = new Date().toISOString().split('T')[0]
        const membersPaid = chitConts.filter(c => c.payment_status === 'paid').length
        const membersPending = chitConts.filter(c => c.payment_status === 'pending' && c.due_date >= today).length
        const membersOverdue = chitConts.filter(c => c.payment_status === 'pending' && c.due_date < today).length
        
        return {
          ...chit,
          totalDue,
          totalPaid,
          percentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0,
          membersPaid,
          membersPending,
          membersOverdue,
          totalMembers: chit.total_members || (membersPaid + membersPending + membersOverdue) || 0
        }`;

// Try to replace with different line endings if standard fails
if (code.includes(oldLoop)) {
  code = code.replace(oldLoop, newLoop);
} else {
  // Try CRLF normalize
  const normalizedCode = code.replace(/\r\n/g, '\n');
  if (normalizedCode.includes(oldLoop)) {
    code = normalizedCode.replace(oldLoop, newLoop);
  } else {
    console.error("Target content not found in api.js");
  }
}

fs.writeFileSync('src/features/finance/api.js', code);
console.log("Updated API.js");
