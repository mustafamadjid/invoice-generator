import { formatCurrency, formatDate, formatTime } from '../lib/formatters.js'

export default function Summary({ totals, transaction, error }) {
  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Ringkasan transaksi</h2>
      <p className="hint">{formatDate(transaction.date)} · {formatTime(transaction.time)}</p>
      <div aria-live="polite" aria-atomic="true">
        <dl>
          <div><dt>Total QTY</dt><dd>{totals ? totals.totalQty : '—'}</dd></div>
          <div><dt>Sub Total</dt><dd>{totals ? formatCurrency(totals.subTotal) : '—'}</dd></div>
          <div className="grand-total"><dt>TOTAL</dt><dd>{totals ? formatCurrency(totals.grandTotal) : '—'}</dd></div>
        </dl>
        <p className={error ? 'field-error' : 'summary-status'}>
          {error || (totals ? 'Data transaksi valid.' : 'Lengkapi semua field agar total dapat dihitung.')}
        </p>
      </div>
    </section>
  )
}
