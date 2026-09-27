export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const PROJECT_FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

export const homePathFor = (role) => (role === 'supervisor' ? '/supervisor' : '/dashboard');

export const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
export const MAX_UPLOAD_MB = 10;

export const labelFor = (list, value) => list.find((i) => i.value === value)?.label ?? value;

export function documentTypeLabel(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  if (ext === 'ppt' || ext === 'pptx') return 'PowerPoint';
  return 'File';
}

// Builds the shareable link a project leader sends to teammates.
export function buildInviteUrl(token) {
  const { origin, pathname } = window.location;
  if (import.meta.env.VITE_ROUTER_MODE === 'hash') return `${origin}${pathname}#/join/${token}`;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${origin}${base}/join/${token}`;
}
