import { describe, expect, it } from 'vitest';
import { milestoneProgress, milestoneStatus, percent, projectProgress, projectStatus, taskProgress } from '../utils/progress';
import { deadlineLabel, toISODate } from '../utils/dates';

const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISODate(d); };
const task = (id, milestoneId, status) => ({ id, milestoneId, status });

describe('progress calculations', () => {
  it('handles empty lists without dividing by zero', () => {
    expect(percent(0, 0)).toBe(0);
    expect(taskProgress([])).toBe(0);
  });

  it('calculates task, milestone and project progress from task status', () => {
    const tasks = [task(1, 'a', 'done'), task(2, 'a', 'todo'), task(3, 'b', 'done'), task(4, 'b', 'done')];
    expect(taskProgress(tasks)).toBe(75);
    expect(milestoneProgress({ id: 'a' }, tasks)).toBe(50);
    expect(milestoneProgress({ id: 'b' }, tasks)).toBe(100);
    expect(projectProgress({ tasks })).toBe(75);
  });
});

describe('status rules', () => {
  it('marks a finished project as completed even when past its end date', () => {
    expect(projectStatus({ endDate: day(-5), tasks: [task(1, 'a', 'done')] })).toBe('completed');
  });
  it('marks unfinished projects past their end date as overdue', () => {
    expect(projectStatus({ endDate: day(-1), tasks: [task(1, 'a', 'todo')] })).toBe('overdue');
  });
  it('treats other projects as active', () => {
    expect(projectStatus({ endDate: day(10), tasks: [task(1, 'a', 'todo')] })).toBe('active');
  });
  it('derives milestone status', () => {
    const tasks = [task(1, 'm', 'todo')];
    expect(milestoneStatus({ id: 'm', startDate: day(5), deadline: day(20) }, tasks)).toBe('not_started');
    expect(milestoneStatus({ id: 'm', startDate: day(-5), deadline: day(20) }, tasks)).toBe('in_progress');
    expect(milestoneStatus({ id: 'm', startDate: day(-20), deadline: day(-1) }, tasks)).toBe('overdue');
  });
});

describe('deadline labels', () => {
  it('describes upcoming and overdue dates', () => {
    expect(deadlineLabel(day(0))).toBe('Due today');
    expect(deadlineLabel(day(3))).toBe('Due in 3 days');
    expect(deadlineLabel(day(-2))).toBe('2 days overdue');
  });
});
