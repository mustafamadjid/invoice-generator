import Field from './Field.jsx'

export default function TransactionForm({ transaction, onChange, onBlur, errorFor }) {
  return (
    <section className="form-section" aria-labelledby="transaction-heading">
      <h2 id="transaction-heading">Informasi transaksi</h2>
      <div className="field-grid">
        {[
          ['date', 'Tanggal', 'date'],
          ['time', 'Waktu', 'time'],
          ['customer', 'Pelanggan', 'text'],
          ['cashier', 'Kasir', 'text'],
        ].map(([key, label, type]) => (
          <Field key={key} path={`transaction.${key}`} label={label} value={transaction[key]} type={type}
            max={type === 'date' ? '9999-12-31' : undefined}
            min={type === 'date' ? '0001-01-01' : undefined}
            hint={type === 'text' ? 'Maksimal 80 karakter' : undefined}
            onChange={(value) => onChange(key, value)} onBlur={onBlur}
            error={errorFor(`transaction.${key}`)} />
        ))}
      </div>
    </section>
  )
}
