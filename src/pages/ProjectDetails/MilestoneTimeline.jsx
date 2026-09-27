import { formatDate, parseDate, todayISO } from '../../utils/dates';
import { milestoneProgress, milestoneStatus } from '../../utils/progress';
import { EmptyState } from '../../components/ui';

const clamp = (n) => Math.max(0, Math.min(100, n));

/** Gantt-style view: each milestone is a bar on the project's start-to-end timeline, filled by progress. */
export default function MilestoneTimeline({ project }) {
  const start = parseDate(project.startDate).getTime();
  const span = Math.max(parseDate(project.endDate).getTime() - start, 1);
  const pos = (date) => clamp(((parseDate(date).getTime() - start) / span) * 100);
  const todayPos = ((parseDate(todayISO()).getTime() - start) / span) * 100;
  const showToday = todayPos >= 0 && todayPos <= 100;

  const rows = [...project.milestones].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (rows.length === 0) {
    return <EmptyState compact title="No milestones yet" message="Add milestones in the Milestones tab to see them on the project timeline." />;
  }

  return (
    <div className="gantt">
      <div className="gantt__scale">
        <span>{formatDate(project.startDate)}</span>
        <span>{formatDate(project.endDate)}</span>
      </div>
      <ol className="gantt__rows">
        {rows.map((m) => {
          const progress = milestoneProgress(m, project.tasks);
          const status = milestoneStatus(m, project.tasks);
          const left = pos(m.startDate);
          const width = Math.max(pos(m.deadline) - left, 2);
          return (
            <li key={m.id} className="gantt__row">
              <div className="gantt__label">
                <span className="gantt__name">{m.name}</span>
                <span className="gantt__sub">{progress}% complete</span>
              </div>
              <div className="gantt__lane">
                {showToday && <span className="gantt__today" style={{ left: `${todayPos}%` }} />}
                <div
                  className={`gantt__bar gantt__bar--${status}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${m.name}: ${formatDate(m.startDate)} to ${formatDate(m.deadline)}`}
                >
                  <div className="gantt__fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {showToday && <p className="gantt__legend"><span className="gantt__legend-line" /> Today</p>}
    </div>
  );
}
