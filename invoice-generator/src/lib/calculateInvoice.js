function safeInteger(value, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) {
    throw new RangeError('Nilai transaksi harus berupa bilangan bulat yang aman')
  }
  return value
}

export function calculateTotals(items) {
  let totalQty = 0
  let subTotal = 0
  const lineTotals = items.map(({ quantity, unitPrice }) => {
    safeInteger(quantity, 1)
    safeInteger(unitPrice)
    const total = safeInteger(quantity * unitPrice)
    totalQty = safeInteger(totalQty + quantity)
    subTotal = safeInteger(subTotal + total)
    return total
  })
  return { lineTotals, totalQty, subTotal, grandTotal: subTotal }
}
