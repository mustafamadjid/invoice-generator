// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createSampleInvoice } from '../data/sampleInvoice.js'
import { createReceiptBlob } from './receiptPdf.js'

async function inspect(invoice) {
  const blob = await createReceiptBlob(invoice)
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const loadingTask = getDocument({ data: bytes, useSystemFonts: false })
  const document = await loadingTask.promise
  const page = await document.getPage(1)
  const content = await page.getTextContent()
  const operators = await page.getOperatorList()
  const result = {
    blob,
    pages: document.numPages,
    width: page.view[2] - page.view[0],
    height: page.view[3] - page.view[1],
    items: content.items.filter((item) => item.str),
    text: content.items.map((item) => item.str).join(' ').replace(/\s+/g, ' '),
    dashes: operators.fnArray.filter((op) => op === OPS.setDash).length,
  }
  await loadingTask.destroy()
  return result
}

describe('real receipt PDF output', () => {
  it('embeds the reference content on one 80mm page with bold totals and dashed rules', async () => {
    const result = await inspect(createSampleInvoice())
    expect(result.blob.type).toBe('application/pdf')
    expect(result.pages).toBe(1)
    expect(result.width).toBeCloseTo(226.77, 2)
    for (const text of [
      "Garchick's Kitchen", '082175673461', '19/10/2026', '16:42', 'Yuni', 'Mustafa Madjid',
      '1. Ricebowl Spesial + Kulit', '2. Es Teh Manis',
      '22 x Rp 16.000', 'Rp 352.000', '22 x Rp 2.000', 'Rp 44.000',
      'Total QTY :', '44', 'Sub Total', 'TOTAL', 'Rp 396.000',
      'QRIS', 'Lunas', 'Terima kasih telah membeli makanan kami!',
    ]) expect(result.text).toContain(text)
    expect(result.dashes).toBeGreaterThanOrEqual(5)
    expect(result.items.find((item) => item.str === 'TOTAL').fontName)
      .not.toBe(result.items.find((item) => item.str === 'Sub Total').fontName)
  })

  it('grows to fit 50 maximum-length items while keeping every glyph and footer inside the page', async () => {
    const sample = createSampleInvoice()
    const short = await inspect(sample)
    const long = createSampleInvoice()
    long.store.name = `${'Toko '.repeat(14)}NamaTokoAB`
    long.store.address = Array.from({ length: 6 }, (_, index) =>
      `Alamat ${index} ${'X'.repeat(index === 5 ? 41 : 40)}`).join('\n')
    long.store.phone = '0'.repeat(30)
    long.store.footer = Array.from({ length: 4 }, (_, index) =>
      `Footer ${index} ${'Y'.repeat(index === 3 ? 31 : 30)}`).join('\n')
    long.transaction.customer = `${'Pelanggan '.repeat(7)}${'X'.repeat(10)}`
    long.transaction.cashier = `${'Kasir '.repeat(13)}XX`
    long.transaction.paymentMethod = 'Lainnya'
    long.transaction.customPaymentMethod = 'Pembayaran melalui kartu debit pelanggan'
    long.items = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`, name: `${String(i + 1).padStart(2, '0')}${'X'.repeat(78)}`,
      quantity: '999', unitPrice: '9999999',
    }))
    expect(long.store.name).toHaveLength(80)
    expect(long.store.address).toHaveLength(300)
    expect(long.store.phone).toHaveLength(30)
    expect(long.store.footer).toHaveLength(160)
    expect(long.transaction.customer).toHaveLength(80)
    expect(long.transaction.cashier).toHaveLength(80)
    expect(long.transaction.customPaymentMethod).toHaveLength(40)
    expect(long.items[0].name).toHaveLength(80)
    const result = await inspect(long)
    expect(result.pages).toBe(1)
    expect(result.width).toBeCloseTo(226.77, 2)
    expect(result.height).toBeGreaterThan(short.height)
    expect(result.text).toContain('Rp 499.499.950.050')
    expect(result.text).toContain('Rp 9.989.999.001')
    expect(result.text).toContain('49950')
    expect(result.text).toContain('50.')
    expect(result.text).toContain('NamaTokoAB')
    expect(result.text).toContain('Alamat 5')
    expect(result.text).toContain('Footer 3')
    for (const item of result.items) {
      expect(item.transform[4]).toBeGreaterThanOrEqual(16)
      expect(item.transform[4] + item.width).toBeLessThanOrEqual(result.width - 16)
      expect(item.transform[5]).toBeGreaterThan(10)
      expect(item.transform[5] + item.height).toBeLessThan(result.height)
    }
  }, 20000)

  it('uses edited identity, payment status and custom payment text without retaining sample data', async () => {
    const invoice = createSampleInvoice()
    invoice.store.name = 'Toko Baru'
    invoice.store.phone = '0012345'
    invoice.transaction.paymentMethod = 'Lainnya'
    invoice.transaction.customPaymentMethod = 'Kartu debit'
    invoice.transaction.paymentStatus = 'Belum Lunas'
    invoice.items = [{ ...invoice.items[1], quantity: '1', unitPrice: '0' }]
    const result = await inspect(invoice)
    expect(result.text).toContain('Toko Baru')
    expect(result.text).toContain('0012345')
    expect(result.text).toContain('Kartu debit')
    expect(result.text).toContain('Belum Lunas')
    expect(result.text).toContain('1. Es Teh Manis')
    expect(result.text).toContain('Rp 0')
    expect(result.text).not.toContain("Garchick's Kitchen")
    expect(result.text).not.toContain('QRIS')
  })

  it('rejects invalid raw form data before producing a receipt', async () => {
    const invoice = createSampleInvoice()
    invoice.items[0].unitPrice = ''
    await expect(createReceiptBlob(invoice)).rejects.toThrow('Harga satuan wajib diisi')
  })

  it('keeps Waktu and Kasir on the next row when a long customer wraps', async () => {
    const invoice = createSampleInvoice()
    invoice.transaction.customer = 'C'.repeat(80)
    const result = await inspect(invoice)
    const customerLines = result.items.filter((item) => /^C+$/.test(item.str))
    expect(customerLines.length).toBeGreaterThan(1)
    const time = result.items.find((item) => item.str.includes('Waktu:'))
    const cashier = result.items.find((item) => item.str.includes('Kasir:'))
    expect(time.transform[5]).toBeLessThan(Math.min(...customerLines.map((item) => item.transform[5])))
    expect(time.transform[5]).toBeCloseTo(cashier.transform[5], 1)
  })
})
