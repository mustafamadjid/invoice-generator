import Field from './Field.jsx'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../lib/validateInvoice.js'

export default function PaymentForm({ transaction, onChange, onBlur, errorFor }) {
  return (
    <section className="form-section" aria-labelledby="payment-heading">
      <h2 id="payment-heading">Pembayaran</h2>
      <div className="field-grid">
        <Field path="transaction.paymentMethod" label="Metode pembayaran"
          value={transaction.paymentMethod} options={PAYMENT_METHODS}
          onChange={(value) => onChange('paymentMethod', value)} onBlur={onBlur}
          error={errorFor('transaction.paymentMethod')} />
        <Field path="transaction.paymentStatus" label="Status pembayaran"
          value={transaction.paymentStatus} options={PAYMENT_STATUSES}
          onChange={(value) => onChange('paymentStatus', value)} onBlur={onBlur}
          error={errorFor('transaction.paymentStatus')} />
        {transaction.paymentMethod === 'Lainnya' && (
          <Field path="transaction.customPaymentMethod" label="Nama metode pembayaran"
            value={transaction.customPaymentMethod} hint="Maksimal 40 karakter"
            onChange={(value) => onChange('customPaymentMethod', value)} onBlur={onBlur}
            error={errorFor('transaction.customPaymentMethod')} />
        )}
      </div>
      <Field path="transaction.notes" label="Catatan order"
        value={transaction.notes} multiline required={false} maxLength={160}
        hint="Opsional. Maksimal 160 karakter dan 4 baris."
        onChange={(value) => onChange('notes', value)} onBlur={onBlur}
        error={errorFor('transaction.notes')} />
    </section>
  )
}
