export const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)} k`
  return `₹${num.toLocaleString()}`
}
