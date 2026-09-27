export default function ProgressBar({ value = 0, label, size = 'md', showValue = true }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress progress--${size}`}>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className={`progress__fill ${pct === 100 ? 'is-complete' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="progress__value">{pct}%</span>}
    </div>
  );
}
