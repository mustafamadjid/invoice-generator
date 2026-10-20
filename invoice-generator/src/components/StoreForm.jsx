import Field from './Field.jsx'

export default function StoreForm({ store, onChange, onBlur, errorFor }) {
  return (
    <section className="form-section" aria-labelledby="store-heading">
      <h2 id="store-heading">Informasi toko</h2>
      <div className="field-grid">
        {[
          ['name', 'Nama toko', 'Maksimal 80 karakter', false, 'text'],
          ['phone', 'Nomor telepon', 'Maksimal 30 karakter', false, 'tel'],
          ['address', 'Alamat', 'Maksimal 300 karakter, 6 baris', true],
          ['footer', 'Footer', 'Maksimal 160 karakter, 4 baris', true],
        ].map(([key, label, hint, multiline, type]) => (
          <Field key={key} path={`store.${key}`} label={label} value={store[key]}
            hint={hint} multiline={multiline} type={type}
            onChange={(value) => onChange(key, value)} onBlur={onBlur}
            error={errorFor(`store.${key}`)} />
        ))}
      </div>
    </section>
  )
}
