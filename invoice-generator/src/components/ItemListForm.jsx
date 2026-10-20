import Field from './Field.jsx'
import { MAX_ITEMS } from '../lib/validateInvoice.js'
import { formatCurrency } from '../lib/formatters.js'

export default function ItemListForm({ items, onChange, onAdd, onRemove, onBlur, errorFor, totals }) {
  return (
    <section className="form-section" aria-labelledby="items-heading">
      <div className="section-heading">
        <h2 id="items-heading">Daftar produk</h2>
        <span className="hint">{items.length} / {MAX_ITEMS} produk</span>
      </div>
      {items.map((item, index) => (
        <fieldset className="item-row" key={item.id}>
          <legend>Produk {index + 1}</legend>
          <div className="item-grid">
            <Field path={`items.${index}.name`} label={`Nama produk ${index + 1}`}
              value={item.name} hint="Maksimal 80 karakter"
              onChange={(value) => onChange(item.id, 'name', value)}
              onBlur={onBlur} error={errorFor(`items.${index}.name`)} />
            <Field path={`items.${index}.quantity`} label={`QTY produk ${index + 1}`}
              value={item.quantity} type="number" inputMode="numeric" min="1" max="999" step="1"
              hint="1–999" onChange={(value) => onChange(item.id, 'quantity', value)}
              onBlur={onBlur} error={errorFor(`items.${index}.quantity`)} />
            <Field path={`items.${index}.unitPrice`} label={`Harga satuan produk ${index + 1}`}
              value={item.unitPrice} type="number" inputMode="numeric" min="0" max="9999999" step="1"
              hint="Rupiah, 0–9.999.999" onChange={(value) => onChange(item.id, 'unitPrice', value)}
              onBlur={onBlur} error={errorFor(`items.${index}.unitPrice`)} />
          </div>
          <div className="item-footer">
            <span>Jumlah <strong>{totals ? formatCurrency(totals.lineTotals[index]) : '—'}</strong></span>
            <button type="button" className="text-button" aria-label={`Hapus produk ${index + 1}`}
              disabled={items.length === 1} onClick={() => onRemove(item.id)}>Hapus</button>
          </div>
        </fieldset>
      ))}
      {errorFor('items') && <p className="field-error">{errorFor('items')}</p>}
      <button type="button" onClick={onAdd} disabled={items.length >= MAX_ITEMS}>Tambah Produk</button>
      {items.length >= MAX_ITEMS && <p className="hint">Maksimal 50 produk per transaksi.</p>}
    </section>
  )
}
