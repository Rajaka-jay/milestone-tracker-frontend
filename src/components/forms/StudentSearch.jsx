import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { usersApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Avatar, Spinner } from '../ui';

/** Search students by name or email and pick one. Used when creating a project and inviting to a team. */
export default function StudentSearch({ onPick, excludeIds = [], projectId, actionLabel = 'Add', id = 'student-search' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const term = useDebounce(query.trim(), 250);
  const excluded = excludeIds.join(',');

  useEffect(() => {
    if (!term) { setResults([]); return undefined; }
    let cancelled = false;
    setLoading(true);
    usersApi.searchStudents(term, projectId)
      .then((r) => { if (!cancelled) setResults(r); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [term, projectId]);

  const visible = results.filter((r) => !excluded.split(',').includes(r.id));

  return (
    <div className="student-search">
      <label className="field__label" htmlFor={id}>Search students by name or email</label>
      <div className="input-wrap">
        <Search size={16} className="input-wrap__icon" />
        <input id={id} className="input input--with-icon" type="search" placeholder="Start typing a name" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {term && (
        <ul className="student-search__list">
          {loading && <li className="student-search__status"><Spinner /> Searching…</li>}
          {!loading && visible.length === 0 && <li className="student-search__status">No matching students found.</li>}
          {!loading && visible.map((s) => (
            <li key={s.id} className="student-search__item">
              <Avatar name={s.fullName} size="sm" />
              <span className="student-search__who"><strong>{s.fullName}</strong><small>{s.email}</small></span>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => { onPick(s); setQuery(''); }}>{actionLabel}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
