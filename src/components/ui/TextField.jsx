/** Label + control + validation message, used by every form. */
export function TextField({ label, id, error, hint, required, as = 'input', children, className = '', ...props }) {
  const Control = as;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      <Control
        id={id}
        className={`input ${as === 'textarea' ? 'input--area' : ''} ${as === 'select' ? 'input--select' : ''} ${error ? 'input--error' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      >
        {children}
      </Control>
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="field__error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
