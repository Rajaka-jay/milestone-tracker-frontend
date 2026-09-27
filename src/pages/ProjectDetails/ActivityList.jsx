import { timeAgo } from '../../utils/dates';

export default function ActivityList({ items, showProject = false }) {
  if (!items.length) return <p className="card__empty">No activity recorded yet.</p>;
  return (
    <ol className="activity">
      {items.map((h) => (
        <li key={h.id} className="activity__item">
          <p>
            <strong>{h.actorName}</strong> {h.message}
            {showProject && <span className="activity__project"> in {h.projectTitle}</span>}
          </p>
          <time dateTime={h.createdAt}>{timeAgo(h.createdAt)}</time>
        </li>
      ))}
    </ol>
  );
}
