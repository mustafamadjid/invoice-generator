import { expect, it } from 'vitest'
import { createSampleInvoice } from '../data/sampleInvoice.js'
import { receiptFilename } from './receiptFilename.js'

it('builds a safe Indonesian receipt filename from shop, customer and ISO date', () => {
  const invoice = createSampleInvoice()
  expect(receiptFilename(invoice)).toBe('struk-garchicks-kitchen-yuni-2026-10-19.pdf')
})

it('normalizes accents and punctuation and caps each user-provided filename segment', () => {
  const invoice = createSampleInvoice()
  invoice.store.name = '  Kafe Étoile / 24  '
  invoice.transaction.customer = 'Mbak Yuni (VIP)!'
  expect(receiptFilename(invoice)).toBe('struk-kafe-etoile-24-mbak-yuni-vip-2026-10-19.pdf')
  invoice.store.name = 'S'.repeat(200)
  expect(receiptFilename(invoice).length).toBeLessThan(150)
  expect(receiptFilename(invoice)).toMatch(/^[a-z0-9-]+\.pdf$/)
})
