import { memberStats } from '../../utils/progress';
import { formatDate } from '../../utils/dates';
import ProgressBar from '../ProgressBar/ProgressBar';
import { Avatar, Badge, TaskStatusBadge } from '../ui';

export default function TeamMemberCard({ member, tasks, isYou = false }) {
  const stats = memberStats(member.id, tasks);
  const shown = stats.assigned.slice(0, 4);
  return (
    <article className="member">
      <header className="member__head">
        <Avatar name={member.fullName} size="lg" />
        <div className="member__who">
          <h3 className="member__name">{member.fullName}{isYou && <span className="member__you"> (you)</span>}</h3>
          <p className="member__email">{member.email}</p>
        </div>
        <Badge tone={member.projectRole === 'leader' ? 'blue' : 'gray'}>{member.projectRole === 'leader' ? 'Project leader' : 'Team member'}</Badge>
      </header>

      <div className="member__progress">
        <div className="member__progress-label">
          <span>Member progress</span>
          <span>{stats.done} of {stats.total} tasks done</span>
        </div>
        <ProgressBar value={stats.progress} label={`${member.fullName} progress`} />
      </div>

      {stats.total === 0 ? (
        <p className="card__empty">No tasks assigned yet.</p>
      ) : (
        <ul className="member__tasks" aria-label={`Tasks assigned to ${member.fullName}`}>
          {shown.map((t) => (
            <li key={t.id}>
              <span className="member__task-title">{t.title}</span>
              <span className="member__task-due">{formatDate(t.deadline)}</span>
              <TaskStatusBadge status={t.status} />
            </li>
          ))}
          {stats.total > shown.length && <li className="member__more">+{stats.total - shown.length} more assigned</li>}
        </ul>
      )}
    </article>
  );
}
