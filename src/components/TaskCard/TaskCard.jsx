import { Calendar, GripVertical } from 'lucide-react';
import { formatDate } from '../../utils/dates';
import { isTaskOverdue } from '../../utils/progress';
import { TASK_STATUSES } from '../../utils/constants';
import { Avatar, PriorityBadge } from '../ui';

export default function TaskCard({ task, milestone, assignee, canEdit, onOpen, onStatusChange }) {
  const overdue = isTaskOverdue(task);
  return (
    <article
      className={`task-card ${canEdit ? 'is-draggable' : ''}`}
      draggable={canEdit}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="task-card__top">
        <button type="button" className="task-card__title" onClick={() => onOpen(task)}>{task.title}</button>
        {canEdit && <GripVertical size={16} className="task-card__grip" aria-hidden="true" />}
      </div>
      {milestone && <p className="task-card__milestone">{milestone.name}</p>}
      <div className="task-card__meta">
        <PriorityBadge priority={task.priority} />
        <span className={`task-card__due ${overdue ? 'is-overdue' : ''}`}><Calendar size={13} /> {formatDate(task.deadline)}</span>
      </div>
      <div className="task-card__foot">
        <span className="task-card__assignee">
          <Avatar name={assignee?.fullName} size="xs" />
          {assignee?.fullName ?? 'Unassigned'}
        </span>
        {canEdit && (
          <select className="task-card__status" aria-label={`Change status of ${task.title}`} value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
            {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
      </div>
    </article>
  );
}
