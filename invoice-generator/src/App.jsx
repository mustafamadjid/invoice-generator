import { useMemo, useState } from 'react'
import { usePdfPreview } from './hooks/usePdfPreview.js'
import { createInitialInvoice, createItem } from './data/initialInvoice.js'
import { createSampleInvoice } from './data/sampleInvoice.js'
import { MAX_ITEMS, validateInvoice } from './lib/validateInvoice.js'
import { calculateTotals } from './lib/calculateInvoice.js'
import { receiptFilename } from './lib/receiptFilename.js'
import StoreForm from './components/StoreForm.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import ItemListForm from './components/ItemListForm.jsx'
import PaymentForm from './components/PaymentForm.jsx'
import Summary from './components/Summary.jsx'
import ReceiptPreview from './components/ReceiptPreview.jsx'

function App() {
  const [invoice, setInvoice] = useState(createInitialInvoice)
  const [paperSize, setPaperSize] = useState('58mm')
  const [touched, setTouched] = useState({})
  const validation = useMemo(() => validateInvoice(invoice), [invoice])
  const calculation = useMemo(() => {
    if (!validation.data) return { totals: null, error: '' }
    try {
      return { totals: calculateTotals(validation.data.items), error: '' }
    } catch {
      return { totals: null, error: 'Total transaksi tidak aman. Kurangi QTY atau harga satuan.' }
    }
  }, [validation])
  const preview = usePdfPreview(invoice, Boolean(calculation.totals), paperSize)
  const filename = receiptFilename(invoice)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const markTouched = (path) => setTouched((current) => ({ ...current, [path]: true }))
  const errorFor = (path) => touched[path] ? validation.errors[path] : undefined
  const updateSection = (section, key, value) => {
    setInvoice((current) => ({
      ...current, [section]: { ...current[section], [key]: value },
    }))
  }
  const updateItem = (id, key, value) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item),
    }))
  }
  const selectProduct = (itemId, product) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) => item.id === itemId
        ? { ...item, name: product.name, unitPrice: product.unitPrice }
        : item),
    }))
  }
  const addItem = () => {
    const item = createItem()
    setInvoice((current) => current.items.length >= MAX_ITEMS ? current : {
      ...current, items: [...current.items, item],
    })
  }
  const removeItem = (id) => {
    setInvoice((current) => current.items.length <= 1 ? current : {
      ...current, items: current.items.filter((item) => item.id !== id),
    })
    setTouched((current) => Object.fromEntries(
      Object.entries(current).filter(([path]) => !path.startsWith('items.')),
    ))
  }
  const replaceInvoice = (next) => {
    setInvoice(next)
    setTouched({})
  }
  const reset = () => {
    if (window.confirm('Reset form? Semua isian transaksi akan dihapus dan informasi toko kembali ke default.')) {
      replaceInvoice(createInitialInvoice())
    }
  }
  const downloadPdf = async () => {
    if (preview.status !== 'ready' || !preview.url || downloading) return
    setDownloading(true)
    setDownloadError('')
    try {
      // The object URL points to the exact Blob displayed in the preview.
      const link = document.createElement('a')
      link.href = preview.url
      link.download = filename
      link.rel = 'noopener'
      document.body.append(link)
      link.click()
      link.remove()
    } catch {
      setDownloadError('Unduhan gagal. Pastikan unduhan diizinkan, lalu coba lagi.')
    } finally {
      setDownloading(false)
    }
  }
  const fieldProps = { onBlur: markTouched, errorFor }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Invoice Generator</h1>
          <p>Susun data transaksi dan periksa total struk Anda.</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={() => replaceInvoice(createSampleInvoice())}>Isi Data Contoh</button>
          <button type="button" onClick={reset}>Reset Form</button>
        </div>
      </header>
      <p className="session-note">Data hanya tersedia selama halaman ini terbuka. Refresh akan menghapus isian.</p>
      <div className="workspace">
        <form noValidate autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <p className="form-intro">Semua field wajib diisi kecuali catatan order. Harga 0 diperbolehkan untuk produk gratis.</p>
          <StoreForm {...fieldProps} store={invoice.store} onChange={(key, value) => updateSection('store', key, value)} />
          <TransactionForm {...fieldProps} transaction={invoice.transaction} onChange={(key, value) => updateSection('transaction', key, value)} />
          <ItemListForm {...fieldProps} items={invoice.items} onChange={updateItem} onAdd={addItem}
            onSelectProduct={selectProduct}
            onRemove={removeItem} totals={calculation.totals} />
          <PaymentForm {...fieldProps} transaction={invoice.transaction} onChange={(key, value) => updateSection('transaction', key, value)} />
        </form>
        <aside>
          <ReceiptPreview preview={preview} filename={filename} paperSize={paperSize}
            onPaperSizeChange={setPaperSize} onDownload={downloadPdf} downloading={downloading} />
          {downloadError && <p role="alert" className="field-error">{downloadError}</p>}
          <Summary {...calculation} transaction={invoice.transaction} />
        </aside>
      </div>
    </main>
  )
}

export default App
