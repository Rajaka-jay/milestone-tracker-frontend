import { formatDate } from '../../utils/dates';
import { byDeadline, isTaskOverdue } from '../../utils/progress';
import { TASK_STATUSES } from '../../utils/constants';
import { Avatar, PriorityBadge, TaskStatusBadge } from '../ui';

export default function TaskTable({ tasks, milestonesById, membersById, canEdit, onOpen, onStatusChange }) {
  const rows = [...tasks].sort(byDeadline);
  return (
    <div className="card card--flush">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Task</th><th>Milestone</th><th>Assignee</th><th>Deadline</th><th>Priority</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td><button type="button" className="table__link table__link--button" onClick={() => onOpen(t)}>{t.title}</button></td>
                <td>{milestonesById[t.milestoneId]?.name}</td>
                <td>
                  <span className="cell-person"><Avatar name={membersById[t.assigneeId]?.fullName} size="xs" />{membersById[t.assigneeId]?.fullName}</span>
                </td>
                <td className={isTaskOverdue(t) ? 'is-overdue' : ''}>{formatDate(t.deadline)}</td>
                <td><PriorityBadge priority={t.priority} /></td>
                <td>
                  {canEdit ? (
                    <select className="table__select" aria-label={`Status of ${t.title}`} value={t.status} onChange={(e) => onStatusChange(t.id, e.target.value)}>
                      {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  ) : <TaskStatusBadge status={t.status} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
