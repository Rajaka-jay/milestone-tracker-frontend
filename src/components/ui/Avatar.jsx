const COLORS = ['#1F5FD8', '#0F766E', '#6D4AC9', '#B45309', '#B4285A', '#3E4C59'];

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return COLORS[hash % COLORS.length];
}

export function initialsOf(name = '') {
  const parts = name.replace(/^(Dr|Prof)\.?\s+/i, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar avatar--${size}`} style={{ background: colorFor(name) }} title={name} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}

export function AvatarStack({ people = [], max = 4 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((p) => <Avatar key={p.id} name={p.fullName} size="sm" />)}
      {extra > 0 && <span className="avatar avatar--sm avatar--more">+{extra}</span>}
    </span>
  );
}
