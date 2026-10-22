import { useEffect, useRef, useState } from 'react'

export default function ReceiptPreview({
  preview, filename, paperSize, onPaperSizeChange, onDownload, downloading,
}) {
  const canvasRef = useRef(null)
  const printFrameRef = useRef(null)
  const [renderState, setRenderState] = useState({ url: null, status: 'idle', error: '' })
  const [printLoadedUrl, setPrintLoadedUrl] = useState(null)
  const [printError, setPrintError] = useState('')
  const currentRenderState = renderState.url === preview.url ? renderState : null
  const renderError = currentRenderState?.error ?? ''
  const isPreviewLoaded = preview.status === 'ready' && currentRenderState?.status === 'ready'
  const canPrint = preview.status === 'ready' && preview.url && printLoadedUrl === preview.url
    && (isPreviewLoaded || Boolean(renderError))
  const displayStatus = preview.status === 'ready'
    ? renderError ? 'error' : isPreviewLoaded ? 'ready' : 'loading'
    : preview.status

  useEffect(() => {
    if (preview.status !== 'ready' || !preview.url) return undefined

    let active = true
    const canvas = canvasRef.current

    import('../lib/renderReceiptPreview.js')
      .then(({ renderReceiptPreview }) => renderReceiptPreview(preview.url, canvas))
      .then(() => {
        if (active) setRenderState({ url: preview.url, status: 'ready', error: '' })
      })
      .catch(() => {
        if (active) setRenderState({
          url: preview.url,
          status: 'error',
          error: 'Preview PDF tidak dapat ditampilkan. Unduh PDF untuk melihat struk.',
        })
      })

    return () => { active = false }
  }, [preview.status, preview.url])

  const printReceipt = () => {
    setPrintError('')
    try {
      if (!canPrint) throw new Error('PDF is still loading')
      const printWindow = printFrameRef.current?.contentWindow
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
        <span className={`preview-status preview-status-${displayStatus}`} role="status">
          {displayStatus === 'ready' && 'Siap dicetak atau diunduh'}
          {displayStatus === 'loading' && (preview.status === 'ready' ? 'Memuat preview PDF…' : 'Membuat preview…')}
          {displayStatus === 'invalid' && 'Lengkapi data'}
          {displayStatus === 'error' && 'Preview gagal'}
          {displayStatus === 'idle' && 'Belum tersedia'}
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
          <div className="receipt-preview-stage">
            {renderError ? (
              <p className="receipt-preview-error" role="alert">{renderError}</p>
            ) : (
              <div className="receipt-preview-paper" style={{ '--receipt-paper-width': paperSize }}>
                <canvas
                  key={preview.url}
                  ref={canvasRef}
                  className="receipt-preview-canvas"
                  role="img"
                  aria-label="Preview struk PDF"
                />
              </div>
            )}
          </div>
          <iframe
            key={preview.url}
            ref={printFrameRef}
            className="receipt-print-frame"
            src={preview.url}
            title="PDF untuk dicetak"
            aria-hidden="true"
            tabIndex={-1}
            style={{ '--receipt-paper-width': paperSize }}
            onLoad={() => setPrintLoadedUrl(preview.url)}
          />
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
          disabled={preview.status !== 'ready' || !canPrint || downloading}>
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
