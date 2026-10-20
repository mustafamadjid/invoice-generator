function slug(value, fallback) {
  const result = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
  return result || fallback
}

export function receiptFilename(invoice) {
  const { store, transaction } = invoice
  return `struk-${slug(store.name, 'toko')}-${slug(transaction.customer, 'pelanggan')}-${transaction.date}.pdf`
}
