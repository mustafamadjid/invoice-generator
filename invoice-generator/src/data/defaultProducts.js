const menuProducts = [
  { id: 'paket-kotak', name: 'Paket Kotak', unitPrice: '19000' },
  { id: 'ricebowl', name: 'Ricebowl', unitPrice: '12000' },
  { id: 'ricebowl-spesial', name: 'Ricebowl Spesial', unitPrice: '14000' },
  { id: 'ricebowl-spesial-kulit', name: 'Ricebowl Spesial + Kulit', unitPrice: '16000' },
]

const addOnProducts = [
  { id: 'kulit', name: 'Kulit', unitPrice: '2000' },
  { id: 'telur', name: 'Telur', unitPrice: '3000' },
  { id: 'tempe', name: 'Tempe', unitPrice: '3000' },
]

export const DEFAULT_PRODUCTS = [...menuProducts, ...addOnProducts]

export const DEFAULT_PRODUCT_GROUPS = [
  { label: 'Menu', products: menuProducts },
  { label: 'Add-ons', products: addOnProducts },
]
