import { todayISO } from './dates';

export const percent = (done, total) => (total ? Math.round((done / total) * 100) : 0);

export const taskProgress = (tasks = []) =>
  percent(tasks.filter((t) => t.status === 'done').length, tasks.length);

export const milestoneProgress = (milestone, tasks = []) =>
  taskProgress(tasks.filter((t) => t.milestoneId === milestone.id));

export const projectProgress = (project) => taskProgress(project.tasks);

export function projectStatus(project, today = todayISO()) {
  const tasks = project.tasks ?? [];
  if (tasks.length > 0 && projectProgress(project) === 100) return 'completed';
  if (project.endDate < today) return 'overdue';
  return 'active';
}

export function milestoneStatus(milestone, tasks = [], today = todayISO()) {
  const related = tasks.filter((t) => t.milestoneId === milestone.id);
  const progress = taskProgress(related);
  if (related.length > 0 && progress === 100) return 'completed';
  if (milestone.deadline < today) return 'overdue';
  if (progress > 0 || milestone.startDate <= today) return 'in_progress';
  return 'not_started';
}

export const isTaskOverdue = (task, today = todayISO()) =>
  task.status !== 'done' && task.deadline < today;

export function memberStats(memberId, tasks = []) {
  const assigned = tasks.filter((t) => t.assigneeId === memberId);
  const done = assigned.filter((t) => t.status === 'done').length;
  return { assigned, done, total: assigned.length, progress: percent(done, assigned.length) };
}

export function countByStatus(tasks = []) {
  return tasks.reduce(
    (acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }),
    { todo: 0, in_progress: 0, done: 0 },
  );
}

export const byDeadline = (a, b) => a.deadline.localeCompare(b.deadline);
