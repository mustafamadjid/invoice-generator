export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
}

export function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export function formatCurrency(value) {
  return Number.isSafeInteger(value) && value >= 0 ? `Rp ${rupiah.format(value)}` : '—'
}

export function formatDate(value) {
  return isValidDate(value) ? value.split('-').reverse().join('/') : '—'
}

export function formatTime(value) {
  return isValidTime(value) ? value : '—'
}
