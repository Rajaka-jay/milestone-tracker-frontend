import { useState } from 'react';
import { ChevronDown, Plus, Calendar } from 'lucide-react';
import { formatDate, deadlineLabel } from '../../utils/dates';
import { milestoneProgress, milestoneStatus } from '../../utils/progress';
import ProgressBar from '../ProgressBar/ProgressBar';
import { Avatar, MilestoneStatusBadge, TaskStatusBadge } from '../ui';

export default function MilestoneCard({ milestone, tasks, membersById, canEdit, onAddTask, onOpenTask }) {
  const [open, setOpen] = useState(false);
  const related = tasks.filter((t) => t.milestoneId === milestone.id);
  const done = related.filter((t) => t.status === 'done').length;
  const status = milestoneStatus(milestone, tasks);

  return (
    <article className="milestone">
      <header className="milestone__head">
        <div>
          <h3 className="milestone__name">{milestone.name}</h3>
          <p className="milestone__dates">
            <Calendar size={14} /> {formatDate(milestone.startDate)} to {formatDate(milestone.deadline)}
            {status !== 'completed' && <span className={status === 'overdue' ? 'is-overdue' : ''}>{deadlineLabel(milestone.deadline)}</span>}
          </p>
        </div>
        <MilestoneStatusBadge status={status} />
      </header>
      {milestone.description && <p className="milestone__desc">{milestone.description}</p>}
      <ProgressBar value={milestoneProgress(milestone, tasks)} label={`${milestone.name} progress`} />

      <footer className="milestone__foot">
        <button type="button" className="link-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          <ChevronDown size={16} className={open ? 'rot' : ''} />
          {related.length === 0 ? 'No tasks yet' : `${done} of ${related.length} tasks done`}
        </button>
        {canEdit && <button type="button" className="btn btn--secondary btn--sm" onClick={() => onAddTask(milestone.id)}><Plus size={15} /> Add task</button>}
      </footer>

      {open && related.length > 0 && (
        <ul className="milestone__tasks">
          {related.map((t) => (
            <li key={t.id}>
              <button type="button" className="milestone__task" onClick={() => onOpenTask(t)}>
                <Avatar name={membersById[t.assigneeId]?.fullName} size="xs" />
                <span className="milestone__task-title">{t.title}</span>
                <span className="milestone__task-due">{formatDate(t.deadline)}</span>
                <TaskStatusBadge status={t.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
