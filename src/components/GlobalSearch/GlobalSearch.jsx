import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderKanban, ListChecks, Flag, User } from 'lucide-react';
import { searchApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useDismiss } from '../../hooks/useDismiss';
import { Spinner } from '../ui';

const GROUPS = [
  { key: 'projects', label: 'Projects', icon: FolderKanban, to: (r) => `/projects/${r.projectId}` },
  { key: 'milestones', label: 'Milestones', icon: Flag, to: (r) => `/projects/${r.projectId}/milestones` },
  { key: 'tasks', label: 'Tasks', icon: ListChecks, to: (r) => `/projects/${r.projectId}/tasks` },
  { key: 'members', label: 'Team members', icon: User, to: (r) => `/projects/${r.projectId}/team` },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const term = useDebounce(query.trim(), 250);
  useDismiss(ref, open, () => setOpen(false));

  useEffect(() => {
    if (term.length < 2) { setResults(null); setLoading(false); return undefined; }
    let cancelled = false;
    setLoading(true);
    searchApi.all(term)
      .then((r) => { if (!cancelled) setResults(r); })
      .catch(() => { if (!cancelled) setResults(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [term]);

  const groups = GROUPS.filter((g) => results?.[g.key]?.length);
  const showPanel = open && term.length >= 2;

  return (
    <div className="search" ref={ref} role="search">
      <Search size={17} className="search__icon" />
      <input
        type="search"
        className="search__input"
        placeholder="Search projects, tasks, milestones, people"
        aria-label="Search projects, tasks, milestones and team members"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {showPanel && (
        <div className="dropdown search__panel">
          {loading && <div className="search__status"><Spinner /> Searching…</div>}
          {!loading && groups.length === 0 && <p className="search__status">No results for "{term}".</p>}
          {!loading && groups.map(({ key, label, icon: Icon, to }) => (
            <div key={key} className="search__group">
              <div className="search__group-title">{label}</div>
              {results[key].map((r) => (
                <Link key={r.id} to={to(r)} className="search__result" onClick={() => { setOpen(false); setQuery(''); }}>
                  <Icon size={16} />
                  <span className="search__result-text">
                    <span className="search__result-title">{r.title}</span>
                    {r.subtitle && <span className="search__result-sub">{r.subtitle}</span>}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
