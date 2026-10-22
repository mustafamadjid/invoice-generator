import { isValidDate, isValidTime } from './formatters.js'

export const MAX_ITEMS = 50
export const PAYMENT_METHODS = ['QRIS', 'Tunai', 'Transfer', 'Lainnya']
export const PAYMENT_STATUSES = ['Lunas', 'Belum Lunas']

export function validateInvoice(invoice) {
  const errors = {}
  function text(value, path, label, max, lines, optional = false) {
    const normalized = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : ''
    if (!normalized && !optional) errors[path] = `${label} wajib diisi`
    else if (normalized.length > max) errors[path] = `${label} maksimal ${max} karakter`
    else if (lines && normalized.split('\n').length > lines) {
      errors[path] = `${label} maksimal ${lines} baris`
    }
    return normalized
  }
  function integer(value, path, label, min, max) {
    if (typeof value !== 'string' || !value.trim()) {
      errors[path] = `${label} wajib diisi`
      return null
    }
    if (!/^\d+$/.test(value)) {
      errors[path] = `${label} harus berupa bilangan bulat tanpa pemisah`
      return null
    }
    const parsed = Number(value)
    if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
      errors[path] = `${label} harus antara ${min.toLocaleString('id-ID')} dan ${max.toLocaleString('id-ID')}`
      return null
    }
    return parsed
  }
  const store = invoice?.store ?? {}
  const transaction = invoice?.transaction ?? {}
  const normalizedStore = {
    name: text(store.name, 'store.name', 'Nama toko', 80),
    address: text(store.address, 'store.address', 'Alamat', 300, 6),
    phone: text(store.phone, 'store.phone', 'Nomor telepon', 30),
    footer: text(store.footer, 'store.footer', 'Footer', 160, 4),
  }
  const normalizedTransaction = {
    date: transaction.date,
    time: transaction.time,
    customer: text(transaction.customer, 'transaction.customer', 'Pelanggan', 80),
    cashier: text(transaction.cashier, 'transaction.cashier', 'Kasir', 80),
    notes: text(transaction.notes, 'transaction.notes', 'Catatan order', 160, 4, true),
    paymentMethod: transaction.paymentMethod,
    paymentStatus: transaction.paymentStatus,
    customPaymentMethod: '',
  }
  if (!isValidDate(transaction.date)) errors['transaction.date'] = 'Isi tanggal yang valid'
  if (!isValidTime(transaction.time)) errors['transaction.time'] = 'Isi waktu dalam format HH:mm'
  if (!PAYMENT_METHODS.includes(transaction.paymentMethod)) {
    errors['transaction.paymentMethod'] = 'Pilih metode pembayaran yang valid'
  }
  if (!PAYMENT_STATUSES.includes(transaction.paymentStatus)) {
    errors['transaction.paymentStatus'] = 'Pilih status pembayaran yang valid'
  }
  if (transaction.paymentMethod === 'Lainnya') {
    normalizedTransaction.customPaymentMethod = text(
      transaction.customPaymentMethod, 'transaction.customPaymentMethod', 'Nama metode pembayaran', 40,
    )
  }
  const items = Array.isArray(invoice?.items) ? invoice.items : []
  if (items.length < 1 || items.length > MAX_ITEMS) {
    errors.items = `Jumlah produk harus antara 1 dan ${MAX_ITEMS}`
  }
  const normalizedItems = items.map((item, index) => ({
    id: item?.id,
    name: text(item?.name, `items.${index}.name`, 'Nama produk', 80),
    quantity: integer(item?.quantity, `items.${index}.quantity`, 'QTY', 1, 999),
    unitPrice: integer(item?.unitPrice, `items.${index}.unitPrice`, 'Harga satuan', 0, 9999999),
  }))
  return {
    errors,
    data: Object.keys(errors).length ? null : {
      store: normalizedStore, transaction: normalizedTransaction, items: normalizedItems,
    },
  }
}
