export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`segmented__item ${value === o.value ? 'is-active' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <o.icon size={15} />}
          {o.label}
          {o.count !== undefined && <span className="segmented__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }) {
  return (
    <div className="stat">
      <span className={`stat__icon stat__icon--${tone}`}><Icon size={18} /></span>
      <div>
        <div className="stat__value">{value}</div>
        <div className="stat__label">{label}</div>
        {hint && <div className="stat__hint">{hint}</div>}
      </div>
    </div>
  );
}
