let nextItemId = 0

export function createItem() {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `item-${++nextItemId}`,
    name: '', quantity: '1', unitPrice: '',
  }
}

export function createInitialInvoice() {
  return {
    store: {
      name: "Garchick's Kitchen",
      address: 'Perum Beringin Raya,\nJl. Perkutut No.2, Kemiling,\nBandar Lampung',
      phone: '082175673461',
      footer: 'Terima kasih telah membeli\nmakanan kami!',
    },
    transaction: {
      date: '', time: '', customer: '', cashier: '',
      paymentMethod: 'QRIS', customPaymentMethod: '', paymentStatus: 'Lunas',
    },
    items: [createItem()],
  }
}
