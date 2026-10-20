export default function ReceiptPreview({ preview, filename, onDownload, downloading }) {
  return (
    <section className="preview-panel" aria-labelledby="preview-heading">
      <div className="preview-heading">
        <h2 id="preview-heading">Preview struk</h2>
        <span className={`preview-status preview-status-${preview.status}`} role="status">
          {preview.status === 'ready' && 'Siap diunduh'}
          {preview.status === 'loading' && 'Membuat preview…'}
          {preview.status === 'invalid' && 'Lengkapi data'}
          {preview.status === 'error' && 'Preview gagal'}
          {preview.status === 'idle' && 'Belum tersedia'}
        </span>
      </div>

      {preview.status === 'ready' && preview.url ? (
        <>
          <iframe className="receipt-frame" src={preview.url} title="Preview struk PDF" />
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

      <button className="download-button" type="button"
        onClick={onDownload}
        disabled={preview.status !== 'ready' || downloading}>
        {downloading ? 'Menyiapkan unduhan…' : 'Download PDF'}
      </button>
      <p className="preview-filename">{preview.status === 'ready' ? filename : 'Nama file tampil saat struk siap.'}</p>
      {downloading && <p role="status" className="hint">Menyiapkan unduhan PDF…</p>}
    </section>
  )
}
