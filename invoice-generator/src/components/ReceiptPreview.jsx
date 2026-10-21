import { useRef, useState } from 'react'

export default function ReceiptPreview({
  preview, filename, paperSize, onPaperSizeChange, onDownload, downloading,
}) {
  const frameRef = useRef(null)
  const [printError, setPrintError] = useState('')

  const printReceipt = () => {
    setPrintError('')
    try {
      const printWindow = frameRef.current?.contentWindow
      if (!printWindow || typeof printWindow.print !== 'function') throw new Error('Print unavailable')
      printWindow.focus()
      printWindow.print()
    } catch {
      setPrintError('Cetak langsung tidak tersedia di browser ini. Gunakan Download PDF.')
    }
  }

  return (
    <section className="preview-panel" aria-labelledby="preview-heading">
      <div className="preview-heading">
        <h2 id="preview-heading">Preview struk</h2>
        <span className={`preview-status preview-status-${preview.status}`} role="status">
          {preview.status === 'ready' && 'Siap dicetak atau diunduh'}
          {preview.status === 'loading' && 'Membuat preview…'}
          {preview.status === 'invalid' && 'Lengkapi data'}
          {preview.status === 'error' && 'Preview gagal'}
          {preview.status === 'idle' && 'Belum tersedia'}
        </span>
      </div>

      <div className="field paper-size-control">
        <label htmlFor="paper-size">Ukuran kertas</label>
        <select id="paper-size" value={paperSize} onChange={(event) => {
          setPrintError('')
          onPaperSizeChange(event.target.value)
        }}>
          <option value="58mm">58 mm</option>
          <option value="80mm">80 mm</option>
        </select>
      </div>

      {preview.status === 'ready' && preview.url ? (
        <>
          <iframe ref={frameRef} className="receipt-frame" src={preview.url} title="Preview struk PDF" />
          <p className="preview-fallback">
            Preview tidak tampil di browser ini? <a href={preview.url} download={filename}>Unduh struk PDF</a>
          </p>
        </>
      ) : (
        <div className="preview-placeholder" aria-live="polite">
          {preview.status === 'loading' && <span className="loading-mark" aria-hidden="true" />}
          {preview.status === 'invalid' && <p>Isi semua field dengan data yang valid untuk melihat struk.</p>}
          {preview.status === 'loading' && <p>Menyiapkan struk sesuai data terbaru…</p>}
          {preview.status === 'error' && (
            <div role="alert">
              <p>Gagal membuat preview PDF. Periksa koneksi; jika tetap gagal, muat ulang halaman. Isian yang belum diunduh akan hilang saat dimuat ulang.</p>
            </div>
          )}
          {preview.status === 'idle' && <p>Isi data transaksi untuk mulai.</p>}
        </div>
      )}

      <div className="preview-actions">
        <button className="print-button" type="button" onClick={printReceipt}
          disabled={preview.status !== 'ready' || downloading}>
          Cetak Struk
        </button>
        <button className="download-button" type="button" onClick={onDownload}
          disabled={preview.status !== 'ready' || downloading}>
          {downloading ? 'Menyiapkan unduhan…' : 'Download PDF'}
        </button>
      </div>
      {printError && <p role="alert" className="field-error">{printError}</p>}
      <p className="preview-filename">{preview.status === 'ready' ? filename : 'Nama file tampil saat struk siap.'}</p>
      {downloading && <p role="status" className="hint">Menyiapkan unduhan PDF…</p>}
    </section>
  )
}
