import { describe, expect, it } from 'vitest'
import { createInitialInvoice } from '../data/initialInvoice.js'
import { createSampleInvoice } from '../data/sampleInvoice.js'
import { validateInvoice } from './validateInvoice.js'
import { calculateTotals } from './calculateInvoice.js'
import { formatCurrency, formatDate, formatTime } from './formatters.js'

describe('invoice validation and calculations', () => {
  it('normalizes the reference transaction and calculates its totals', () => {
    const raw = createSampleInvoice()
    raw.store.name = "  Garchick's Kitchen  "
    raw.store.address = ' A\r\nB '
    const result = validateInvoice(raw)
    expect(result.errors).toEqual({})
    expect(result.data.store.name).toBe("Garchick's Kitchen")
    expect(result.data.store.address).toBe('A\nB')
    expect(raw.items[0].quantity).toBe('22')
    expect(calculateTotals(result.data.items)).toEqual({
      lineTotals: [352000, 44000], totalQty: 44, subTotal: 396000, grandTotal: 396000,
    })
  })

  it('starts with fresh empty items and preserves leading zeroes in phone numbers', () => {
    const first = createInitialInvoice()
    const second = createInitialInvoice()
    first.store.name = 'Changed'
    expect(second.store.name).toBe("Garchick's Kitchen")
    expect(first.items[0].id).not.toBe(second.items[0].id)
    expect(second.items).toHaveLength(1)
    expect(second.items[0].unitPrice).toBe('')
    expect(validateInvoice(second).data).toBeNull()
    expect(validateInvoice(createSampleInvoice()).data.store.phone).toBe('082175673461')
  })

  for (const [field, values] of [
    ['quantity', ['', ' ', '0', '-1', '1.5', '1e2', '+1', '1,000', '1000', 'NaN', 'Infinity']],
    ['unitPrice', ['', ' ', '-1', '1.5', '1e3', '+1', '16.000', '10000000', 'NaN', 'Infinity']],
  ]) {
    it.each(values)(`rejects ${field} input %j before calculating`, (value) => {
      const raw = createSampleInvoice()
      raw.items[0][field] = value
      const result = validateInvoice(raw)
      expect(result.data).toBeNull()
      expect(result.errors[`items.0.${field}`]).toBeTruthy()
    })
  }

  it('accepts an explicit free item and the maximum allowed transaction', () => {
    const raw = createSampleInvoice()
    raw.items = [{ ...raw.items[0], quantity: '1', unitPrice: '0' }]
    expect(calculateTotals(validateInvoice(raw).data.items).grandTotal).toBe(0)
    raw.items = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`, name: 'Produk', quantity: '999', unitPrice: '9999999',
    }))
    const result = validateInvoice(raw)
    expect(result.errors).toEqual({})
    expect(calculateTotals(result.data.items).grandTotal).toBe(499499950050)
    expect(calculateTotals(result.data.items).totalQty).toBe(49950)
  })

  it.each([0, 51])('rejects %i items', (count) => {
    const raw = createSampleInvoice()
    raw.items = Array.from({ length: count }, (_, i) => ({ ...raw.items[0], id: `${i}` }))
    expect(validateInvoice(raw).errors.items).toBeTruthy()
  })

  const textFields = [
    ['store', 'name', 80], ['store', 'address', 300], ['store', 'phone', 30],
    ['store', 'footer', 160], ['transaction', 'customer', 80],
    ['transaction', 'cashier', 80], ['transaction', 'customPaymentMethod', 40],
  ]
  it.each(textFields)('checks blank and length boundaries for %s.%s', (section, field, max) => {
    const raw = createSampleInvoice()
    raw.transaction.paymentMethod = 'Lainnya'
    raw.transaction.customPaymentMethod = 'Kartu'
    raw[section][field] = 'x'.repeat(max)
    expect(validateInvoice(raw).errors[`${section}.${field}`]).toBeUndefined()
    raw[section][field] += 'x'
    expect(validateInvoice(raw).errors[`${section}.${field}`]).toBeTruthy()
    raw[section][field] = ' \r\n '
    expect(validateInvoice(raw).errors[`${section}.${field}`]).toBeTruthy()
  })

  it('checks product name length and multiline limits without truncation', () => {
    const raw = createSampleInvoice()
    raw.items[0].name = 'x'.repeat(80)
    raw.store.address = Array(6).fill('Alamat').join('\r\n')
    raw.store.footer = Array(4).fill('Terima kasih').join('\n')
    expect(validateInvoice(raw).errors).toEqual({})
    raw.items[0].name += 'x'
    raw.store.address += '\nLebih'
    raw.store.footer += '\nLebih'
    const result = validateInvoice(raw)
    expect(result.errors['items.0.name']).toBeTruthy()
    expect(result.errors['store.address']).toBeTruthy()
    expect(result.errors['store.footer']).toBeTruthy()
    expect(raw.items[0].name.length).toBe(81)
  })

  it.each(['', '2026-02-29', '2026-04-31', '2026-13-01', '0000-01-01', '19/10/2026'])(
    'rejects invalid calendar date %j', (date) => {
      const raw = createSampleInvoice()
      raw.transaction.date = date
      expect(validateInvoice(raw).errors['transaction.date']).toBeTruthy()
    },
  )
  it.each(['', '24:00', '12:60', '1:00', '12:00:00'])('rejects invalid time %j', (time) => {
    const raw = createSampleInvoice()
    raw.transaction.time = time
    expect(validateInvoice(raw).errors['transaction.time']).toBeTruthy()
  })

  it('accepts leap day, requires a custom method only when selected, and rejects unknown selections', () => {
    const raw = createSampleInvoice()
    raw.transaction.date = '2024-02-29'
    raw.transaction.time = '00:00'
    expect(validateInvoice(raw).errors).toEqual({})
    raw.transaction.paymentMethod = 'Lainnya'
    expect(validateInvoice(raw).errors['transaction.customPaymentMethod']).toBeTruthy()
    raw.transaction.customPaymentMethod = '  Kartu  '
    expect(validateInvoice(raw).data.transaction.customPaymentMethod).toBe('Kartu')
    raw.transaction.paymentMethod = 'QRIS'
    expect(validateInvoice(raw).data.transaction.customPaymentMethod).toBe('')
    raw.transaction.paymentMethod = 'Unknown'
    raw.transaction.paymentStatus = 'Unknown'
    expect(validateInvoice(raw).errors['transaction.paymentMethod']).toBeTruthy()
    expect(validateInvoice(raw).errors['transaction.paymentStatus']).toBeTruthy()
  })

  it.each([
    [{ quantity: Number.MAX_SAFE_INTEGER, unitPrice: 2 }],
    [{ quantity: 1, unitPrice: Number.MAX_SAFE_INTEGER }, { quantity: 1, unitPrice: 1 }],
    [{ quantity: Number.MAX_SAFE_INTEGER, unitPrice: 0 }, { quantity: 1, unitPrice: 0 }],
    [{ quantity: 1.5, unitPrice: 1 }],
    [{ quantity: 1, unitPrice: -1 }],
    [{ quantity: 1, unitPrice: Infinity }],
    [{ quantity: '1', unitPrice: 0 }],
  ])('rejects unsafe or non-normalized calculation inputs %#', (...items) => {
    expect(() => calculateTotals(items)).toThrow()
  })

  it('formats rupiah and calendar values without timezone shifts', () => {
    expect(formatCurrency(396000)).toBe('Rp 396.000')
    expect(formatCurrency(0)).toBe('Rp 0')
    expect(formatDate('2026-10-19')).toBe('19/10/2026')
    expect(formatDate('2024-02-29')).toBe('29/02/2024')
    expect(formatDate('')).toBe('—')
    expect(formatTime('16:42')).toBe('16:42')
    expect(formatTime('24:00')).toBe('—')
  })
})
