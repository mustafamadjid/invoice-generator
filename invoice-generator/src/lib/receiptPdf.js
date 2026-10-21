import storefront from '../assets/storefront.svg?raw'
import { validateInvoice } from './validateInvoice.js'
import { calculateTotals } from './calculateInvoice.js'
import { formatCurrency, formatDate, formatTime } from './formatters.js'

const PAGE_WIDTH = 226.77
const MARGIN = 18
let pdfMakePromise

async function loadPdfMake() {
  pdfMakePromise ??= Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ]).then(([engine, fonts]) => {
    const pdfMake = engine.default
    pdfMake.addVirtualFileSystem(fonts.default)
    return pdfMake
  })
  const pending = pdfMakePromise
  try {
    return await pending
  } catch (error) {
    if (pdfMakePromise === pending) pdfMakePromise = undefined
    throw error
  }
}

function separator(contentWidth, solid = false) {
  const line = {
    type: 'line', x1: 0, y1: 0, x2: contentWidth, y2: 0,
    lineWidth: 0.5, lineColor: '#000000',
  }
  if (!solid) line.dash = { length: 2, space: 2 }
  return {
    canvas: [line],
    margin: [0, 7, 0, 7],
  }
}

function amountRow(label, value, bold = false) {
  return {
    columns: [
      { text: label, width: 'auto' },
      { text: formatCurrency(value), width: '*', alignment: 'right' },
    ],
    columnGap: 6, bold, fontSize: bold ? 10 : 8,
    margin: [0, bold ? 4 : 2, 0, 0],
  }
}

/**
 * Receives normalized, valid invoice data and totals from calculateTotals().
 * All content stays in document flow so the automatic page height includes it.
 */
export function buildReceiptDefinition(invoice, totals, paperSize = '80mm') {
  const { store, transaction, items } = invoice
  const is58mm = paperSize === '58mm'
  const pageWidth = is58mm ? 58 * 72 / 25.4 : PAGE_WIDTH
  const margin = is58mm ? 14 : MARGIN
  const contentWidth = pageWidth - margin * 2
  const paymentMethod = transaction.paymentMethod === 'Lainnya'
    ? transaction.customPaymentMethod : transaction.paymentMethod
  const transactionDetails = is58mm ? [
    { text: `Tanggal: ${formatDate(transaction.date)}` },
    { text: `Waktu: ${formatTime(transaction.time)}`, margin: [0, 3, 0, 0] },
    { text: `Pelanggan: ${transaction.customer}`, margin: [0, 3, 0, 0] },
    { text: `Kasir: ${transaction.cashier}`, margin: [0, 3, 0, 0] },
  ] : [
    {
      columns: [
        { text: `Tanggal: ${formatDate(transaction.date)}`, width: 77 },
        { text: `Pelanggan: ${transaction.customer}`, width: contentWidth - 83, alignment: 'right' },
      ],
      columnGap: 6,
    },
    {
      columns: [
        { text: `Waktu: ${formatTime(transaction.time)}`, width: 77 },
        { text: `Kasir: ${transaction.cashier}`, width: contentWidth - 83, alignment: 'right' },
      ],
      columnGap: 6, margin: [0, 3, 0, 0],
    },
  ]
  const itemsContent = items.map((item, index) => ({
    stack: [
      { text: `${index + 1}. ${item.name}`, bold: true, margin: [0, 0, 0, 3] },
      ...(is58mm ? [
        { text: `${item.quantity} x ${formatCurrency(item.unitPrice)}` },
        {
          text: formatCurrency(totals.lineTotals[index]),
          bold: true, fontSize: 10, alignment: 'right', margin: [0, 2, 0, 0],
        },
      ] : [{
        columns: [
          { text: `${item.quantity} x ${formatCurrency(item.unitPrice)}`, width: '*' },
          { text: formatCurrency(totals.lineTotals[index]), alignment: 'right', width: 'auto' },
        ],
        columnGap: 5,
      }]),
    ],
    margin: [0, 0, 0, index === items.length - 1 ? 0 : 7],
  }))
  const totalsContent = is58mm ? [
    { text: `Total QTY: ${totals.totalQty}`, margin: [0, 0, 0, 3] },
    { text: 'Sub Total' },
    { text: formatCurrency(totals.subTotal), alignment: 'right', margin: [0, 2, 0, 3] },
    {
      columns: [
        { text: 'TOTAL', width: '*' },
        { text: formatCurrency(totals.grandTotal), alignment: 'right', width: 'auto' },
      ],
      bold: true, fontSize: 12,
    },
  ] : [
    { text: `Total QTY : ${totals.totalQty}`, margin: [0, 0, 0, 3] },
    amountRow('Sub Total', totals.subTotal),
    amountRow('TOTAL', totals.grandTotal, true),
  ]
  return {
    pageSize: { width: pageWidth, height: 'auto' },
    pageMargins: [margin, 14, margin, 14],
    defaultStyle: { font: 'Roboto', fontSize: 8, lineHeight: 1.12, color: '#000000' },
    info: { title: `Struk - ${store.name}`, creator: 'Invoice Generator' },
    content: [
      ...(!is58mm ? [{ svg: storefront, width: 27, alignment: 'center', margin: [0, 0, 0, 5] }] : []),
      { text: store.name, fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
      { text: store.address, alignment: 'center' },
      { text: store.phone, alignment: 'center', margin: [0, 3, 0, 0] },
      separator(contentWidth, is58mm),
      ...transactionDetails,
      separator(contentWidth, is58mm),
      ...itemsContent,
      separator(contentWidth, is58mm),
      ...totalsContent,
      separator(contentWidth, is58mm),
      { text: `Metode pembayaran: ${paymentMethod}` },
      { text: `Status: ${transaction.paymentStatus}`, margin: [0, 3, 0, 0] },
      separator(contentWidth, is58mm),
      { text: store.footer, alignment: 'center' },
    ],
  }
}

/** Validates raw form state and returns a real PDF Blob using pdfmake 0.3. */
export async function createReceiptBlob(rawInvoice, paperSize = '80mm') {
  const { data, errors } = validateInvoice(rawInvoice)
  if (!data) throw new Error(Object.values(errors).join('; '))
  const totals = calculateTotals(data.items)
  const definition = buildReceiptDefinition(data, totals, paperSize)
  const pdfMake = await loadPdfMake()
  return pdfMake.createPdf(definition).getBlob()
}
