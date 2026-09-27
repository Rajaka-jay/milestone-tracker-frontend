import { PRIORITIES, TASK_STATUSES, labelFor } from '../../utils/constants';

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

const TASK_TONES = { todo: 'gray', in_progress: 'blue', done: 'green' };
export const TaskStatusBadge = ({ status }) => (
  <Badge tone={TASK_TONES[status]}>{labelFor(TASK_STATUSES, status)}</Badge>
);

const PRIORITY_TONES = { low: 'gray', medium: 'amber', high: 'red' };
export const PriorityBadge = ({ priority }) => (
  <Badge tone={PRIORITY_TONES[priority]}>{labelFor(PRIORITIES, priority)}</Badge>
);

const PROJECT_TONES = { active: ['blue', 'Active'], completed: ['green', 'Completed'], overdue: ['red', 'Overdue'] };
export const ProjectStatusBadge = ({ status }) => (
  <Badge tone={PROJECT_TONES[status][0]}>{PROJECT_TONES[status][1]}</Badge>
);

const MILESTONE_TONES = {
  completed: ['green', 'Completed'],
  in_progress: ['blue', 'In progress'],
  not_started: ['gray', 'Not started'],
  overdue: ['red', 'Overdue'],
};
export const MilestoneStatusBadge = ({ status }) => (
  <Badge tone={MILESTONE_TONES[status][0]}>{MILESTONE_TONES[status][1]}</Badge>
);
