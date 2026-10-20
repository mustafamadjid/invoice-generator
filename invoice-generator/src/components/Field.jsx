export default function Field({
  path, label, value, onChange, onBlur, error, hint, multiline = false, options, ...inputProps
}) {
  const id = `field-${path}`
  const shared = {
    id, name: path, value, required: true,
    onChange: (event) => onChange(event.target.value),
    onBlur: () => onBlur(path),
    'aria-invalid': Boolean(error),
    'aria-describedby': [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
    ...inputProps,
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select {...shared}>{options.map((option) => <option key={option}>{option}</option>)}</select>
      ) : multiline ? <textarea {...shared} rows={3} /> : <input {...shared} />}
      {hint && <span className="hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}
