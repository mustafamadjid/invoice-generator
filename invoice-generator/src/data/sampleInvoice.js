import { createInitialInvoice, createItem } from './initialInvoice.js'

export function createSampleInvoice() {
  const invoice = createInitialInvoice()
  invoice.transaction = {
    ...invoice.transaction,
    date: '2026-10-19', time: '16:42', customer: 'Yuni', cashier: 'Mustafa Madjid',
  }
  invoice.items = [
    { ...createItem(), name: 'Ricebowl Spesial + Kulit', quantity: '22', unitPrice: '16000' },
    { ...createItem(), name: 'Es Teh Manis', quantity: '22', unitPrice: '2000' },
  ]
  return invoice
}
