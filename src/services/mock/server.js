import { ApiError } from '../ApiError';
import { MOCK_LATENCY } from '../../config';
import { loadDb, persist, nextId } from './db';
import { documentTypeLabel } from '../../utils/constants';
import { daysUntil } from '../../utils/dates';
import { validateProject, validateMilestone, validateTask, validateFile } from '../../utils/validators';

/**
 * A tiny fake REST backend. It implements the same endpoints the real Express API
 * is expected to expose, so the UI can be developed and demonstrated without a server.
 */
export const fileStore = new Map();
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const pub = (u) => (u ? { id: u.id, fullName: u.fullName, email: u.email, role: u.role } : null);
const userById = (db, id) => db.users.find((u) => u.id === id);
const now = () => new Date().toISOString();

function canAccess(project, user) {
  return user.role === 'supervisor' ? project.supervisorId === user.id : project.memberIds.includes(user.id);
}
function getProject(db, id, user) {
  const project = db.projects.find((p) => p.id === id);
  if (!project) throw new ApiError('Project not found.', 404);
  if (!canAccess(project, user)) throw new ApiError('You do not have access to this project.', 403);
  return project;
}
function requireMember(project, user) {
  if (user.role !== 'student' || !project.memberIds.includes(user.id)) {
    throw new ApiError('Only project team members can make changes.', 403);
  }
}
function log(db, projectId, actorId, message) {
  db.history.push({ id: nextId('h'), projectId, actorId, message, createdAt: now() });
}
function notify(db, userId, data) {
  db.notifications.push({ id: nextId('n'), userId, read: false, createdAt: now(), ...data });
}

function expand(db, p) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    createdAt: p.createdAt,
    leaderId: p.leaderId,
    supervisorId: p.supervisorId,
    supervisor: pub(userById(db, p.supervisorId)),
    members: p.memberIds.map((id) => ({ ...pub(userById(db, id)), projectRole: id === p.leaderId ? 'leader' : 'member' })),
    pendingInvites: db.invitations
      .filter((i) => i.projectId === p.id && i.status === 'pending')
      .map((i) => ({ id: i.id, user: pub(userById(db, i.inviteeId)) })),
    milestones: db.milestones.filter((m) => m.projectId === p.id),
    tasks: db.tasks.filter((t) => t.projectId === p.id),
    documents: db.documents
      .filter((d) => d.projectId === p.id)
      .map((d) => ({ ...d, uploadedBy: pub(userById(db, d.uploadedById)) }))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    feedback: db.feedback
      .filter((f) => f.projectId === p.id)
      .map((f) => ({ ...f, supervisorName: userById(db, f.supervisorId)?.fullName }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    history: db.history
      .filter((h) => h.projectId === p.id)
      .map((h) => ({ ...h, actorName: userById(db, h.actorId)?.fullName }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

function fail(errors, message = 'Please correct the highlighted fields.') {
  if (Object.keys(errors).length) throw new ApiError(message, 422, errors);
}

const routes = [];
const route = (method, pattern, handler, { open = false } = {}) => {
  routes.push({
    method,
    open,
    regex: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
    handler,
  });
};

// ---------- Auth ----------
route('POST', '/auth/login', ({ db, body }) => {
  const user = db.users.find((u) => u.email.toLowerCase() === (body.email || '').trim().toLowerCase() && u.password === body.password);
  if (!user) throw new ApiError('Email or password is incorrect.', 401);
  return { token: `mock.${user.id}`, user: pub(user) };
}, { open: true });

route('POST', '/auth/register', ({ db, body }) => {
  const email = (body.email || '').trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('An account with this email already exists.', 409, { email: 'This email is already registered.' });
  }
  if (!['student', 'supervisor'].includes(body.role)) throw new ApiError('Choose a role.', 422, { role: 'Choose a role.' });
  const user = { id: nextId('u'), fullName: body.fullName.trim(), email, password: body.password, role: body.role };
  db.users.push(user);
  return { token: `mock.${user.id}`, user: pub(user) };
}, { open: true });

route('POST', '/auth/google', ({ db }) => {
  const user = db.users.find((u) => u.id === 'u1');
  return { token: `mock.${user.id}`, user: pub(user) };
}, { open: true });

route('POST', '/auth/forgot-password', () => ({ message: 'If an account exists for this email, a reset link is on its way.' }), { open: true });
route('GET', '/auth/me', ({ user }) => pub(user));
route('PATCH', '/auth/me', ({ user, body }) => {
  if (!body.fullName?.trim()) throw new ApiError('Enter your full name.', 422, { fullName: 'Enter your full name.' });
  user.fullName = body.fullName.trim();
  return pub(user);
});

// ---------- Users ----------
route('GET', '/users/supervisors', ({ db }) => db.users.filter((u) => u.role === 'supervisor').map(pub));
route('GET', '/users/students', ({ db, user, query }) => {
  const q = (query.q || '').trim().toLowerCase();
  if (!q) return [];
  const project = query.projectId ? db.projects.find((p) => p.id === query.projectId) : null;
  const blocked = new Set([user.id]);
  if (project) {
    project.memberIds.forEach((id) => blocked.add(id));
    db.invitations.filter((i) => i.projectId === project.id && i.status === 'pending').forEach((i) => blocked.add(i.inviteeId));
  }
  return db.users
    .filter((u) => u.role === 'student' && !blocked.has(u.id))
    .filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .slice(0, 6)
    .map(pub);
});

// ---------- Projects ----------
route('GET', '/projects', ({ db, user }) => db.projects.filter((p) => canAccess(p, user)).map((p) => expand(db, p)));

route('POST', '/projects', ({ db, user, body }) => {
  if (user.role !== 'student') throw new ApiError('Only students can create projects.', 403);
  fail(validateProject({ title: body.title || '', description: body.description || '', supervisorId: body.supervisorId, startDate: body.startDate, endDate: body.endDate }));
  const supervisor = userById(db, body.supervisorId);
  if (!supervisor || supervisor.role !== 'supervisor') throw new ApiError('Select a valid supervisor.', 422, { supervisorId: 'Select a valid supervisor.' });
  const project = {
    id: nextId('p'), title: body.title.trim(), description: body.description.trim(), leaderId: user.id,
    supervisorId: supervisor.id, memberIds: [user.id], startDate: body.startDate, endDate: body.endDate, createdAt: now(),
  };
  db.projects.push(project);
  log(db, project.id, user.id, 'created the project');
  (body.inviteeIds || []).forEach((studentId) => {
    const invitation = { id: nextId('i'), projectId: project.id, inviterId: user.id, inviteeId: studentId, status: 'pending' };
    db.invitations.push(invitation);
    notify(db, studentId, { type: 'invitation', message: `${user.fullName} invited you to join "${project.title}".`, projectId: project.id, invitationId: invitation.id });
  });
  return expand(db, project);
});

route('GET', '/projects/:id', ({ db, user, params }) => expand(db, getProject(db, params.id, user)));

route('GET', '/projects/:id/invite-link', ({ db, user, params }) => {
  const project = getProject(db, params.id, user);
  requireMember(project, user);
  return { token: `inv-${project.id}` };
});

route('POST', '/projects/join', ({ db, user, body }) => {
  const project = db.projects.find((p) => `inv-${p.id}` === body.token);
  if (!project) throw new ApiError('This invitation link is not valid.', 404);
  if (user.role !== 'student') throw new ApiError('Only students can join a project team.', 403);
  if (!project.memberIds.includes(user.id)) {
    project.memberIds.push(user.id);
    db.invitations.filter((i) => i.projectId === project.id && i.inviteeId === user.id && i.status === 'pending').forEach((i) => { i.status = 'accepted'; });
    log(db, project.id, user.id, 'joined the project with an invitation link');
  }
  return expand(db, project);
});

route('POST', '/projects/:id/invitations', ({ db, user, params, body }) => {
  const project = getProject(db, params.id, user);
  requireMember(project, user);
  const student = userById(db, body.studentId);
  if (!student || student.role !== 'student') throw new ApiError('Student not found.', 404);
  if (project.memberIds.includes(student.id)) throw new ApiError(`${student.fullName} is already on this team.`, 409);
  if (db.invitations.some((i) => i.projectId === project.id && i.inviteeId === student.id && i.status === 'pending')) {
    throw new ApiError(`${student.fullName} already has a pending invitation.`, 409);
  }
  const invitation = { id: nextId('i'), projectId: project.id, inviterId: user.id, inviteeId: student.id, status: 'pending' };
  db.invitations.push(invitation);
  notify(db, student.id, { type: 'invitation', message: `${user.fullName} invited you to join "${project.title}".`, projectId: project.id, invitationId: invitation.id });
  log(db, project.id, user.id, `invited ${student.fullName}`);
  return { ok: true };
});

// ---------- Milestones & tasks ----------
route('POST', '/projects/:id/milestones', ({ db, user, params, body }) => {
  const project = getProject(db, params.id, user);
  requireMember(project, user);
  fail(validateMilestone({ name: body.name || '', startDate: body.startDate, deadline: body.deadline }, project));
  const milestone = {
    id: nextId('m'), projectId: project.id, name: body.name.trim(), description: (body.description || '').trim(),
    startDate: body.startDate, deadline: body.deadline,
  };
  db.milestones.push(milestone);
  log(db, project.id, user.id, `added milestone "${milestone.name}"`);
  return milestone;
});

route('POST', '/projects/:id/tasks', ({ db, user, params, body }) => {
  const project = getProject(db, params.id, user);
  requireMember(project, user);
  fail(validateTask({ title: body.title || '', milestoneId: body.milestoneId, assigneeId: body.assigneeId, deadline: body.deadline }));
  if (!db.milestones.some((m) => m.id === body.milestoneId && m.projectId === project.id)) throw new ApiError('Milestone not found.', 404);
  if (!project.memberIds.includes(body.assigneeId)) throw new ApiError('Tasks can only be assigned to team members.', 422, { assigneeId: 'Choose a team member.' });
  const task = {
    id: nextId('t'), projectId: project.id, milestoneId: body.milestoneId, title: body.title.trim(),
    description: (body.description || '').trim(), assigneeId: body.assigneeId, deadline: body.deadline,
    priority: body.priority || 'medium', status: body.status || 'todo',
  };
  db.tasks.push(task);
  log(db, project.id, user.id, `created task "${task.title}"`);
  if (task.assigneeId !== user.id && daysUntil(task.deadline) <= 7) {
    notify(db, task.assigneeId, { type: 'deadline', message: `"${task.title}" was assigned to you and is due soon.`, projectId: project.id });
  }
  return task;
});

route('PATCH', '/tasks/:id', ({ db, user, params, body }) => {
  const task = db.tasks.find((t) => t.id === params.id);
  if (!task) throw new ApiError('Task not found.', 404);
  const project = getProject(db, task.projectId, user);
  requireMember(project, user);
  const before = task.status;
  ['title', 'description', 'milestoneId', 'assigneeId', 'deadline', 'priority', 'status'].forEach((key) => {
    if (body[key] !== undefined) task[key] = body[key];
  });
  if (!task.title.trim()) throw new ApiError('Enter a task title.', 422, { title: 'Enter a task title.' });
  if (before !== task.status) {
    const label = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[task.status];
    log(db, project.id, user.id, `marked "${task.title}" as ${label}`);
  } else {
    log(db, project.id, user.id, `updated task "${task.title}"`);
  }
  return task;
});

// ---------- Documents ----------
route('POST', '/projects/:id/documents', ({ db, user, params, body }) => {
  const project = getProject(db, params.id, user);
  requireMember(project, user);
  const file = body.get('file');
  if (!file) throw new ApiError('Choose a file to upload.', 422);
  const problem = validateFile(file);
  if (problem) throw new ApiError(problem, 422);
  const doc = {
    id: nextId('d'), projectId: project.id, name: file.name, type: documentTypeLabel(file.name), size: file.size,
    uploadedById: user.id, uploadedAt: now(),
  };
  db.documents.push(doc);
  fileStore.set(doc.id, file);
  log(db, project.id, user.id, `uploaded ${doc.name}`);
  return doc;
});

route('DELETE', '/documents/:id', ({ db, user, params }) => {
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc) throw new ApiError('Document not found.', 404);
  const project = getProject(db, doc.projectId, user);
  requireMember(project, user);
  db.documents = db.documents.filter((d) => d.id !== doc.id);
  fileStore.delete(doc.id);
  log(db, project.id, user.id, `deleted ${doc.name}`);
  return null;
});

route('GET', '/documents/:id/download', ({ db, user, params }) => {
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc) throw new ApiError('Document not found.', 404);
  getProject(db, doc.projectId, user);
  return fileStore.get(doc.id) || new Blob([`Demo placeholder for "${doc.name}". The real backend returns the uploaded file.`], { type: 'text/plain' });
});

// ---------- Feedback ----------
route('POST', '/projects/:id/feedback', ({ db, user, params, body }) => {
  if (user.role !== 'supervisor') throw new ApiError('Only supervisors can leave feedback.', 403);
  const project = getProject(db, params.id, user);
  if (!body.message?.trim()) throw new ApiError('Write a message before posting.', 422, { message: 'Write a message before posting.' });
  const entry = { id: nextId('f'), projectId: project.id, supervisorId: user.id, message: body.message.trim(), createdAt: now() };
  db.feedback.push(entry);
  log(db, project.id, user.id, 'left feedback');
  project.memberIds.forEach((id) => notify(db, id, { type: 'feedback', message: `${user.fullName} left feedback on "${project.title}".`, projectId: project.id }));
  return { ...entry, supervisorName: user.fullName };
});

// ---------- Notifications ----------
route('GET', '/notifications', ({ db, user }) => db.notifications
  .filter((n) => n.userId === user.id)
  .map((n) => ({ ...n, invitationStatus: n.invitationId ? db.invitations.find((i) => i.id === n.invitationId)?.status : undefined }))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

route('POST', '/notifications/read-all', ({ db, user }) => {
  db.notifications.filter((n) => n.userId === user.id).forEach((n) => { n.read = true; });
  return { ok: true };
});
route('POST', '/notifications/:id/read', ({ db, user, params }) => {
  const n = db.notifications.find((x) => x.id === params.id && x.userId === user.id);
  if (n) n.read = true;
  return { ok: true };
});
route('POST', '/notifications/:id/respond', ({ db, user, params, body }) => {
  const n = db.notifications.find((x) => x.id === params.id && x.userId === user.id);
  const invitation = n && db.invitations.find((i) => i.id === n.invitationId);
  if (!invitation || invitation.status !== 'pending') throw new ApiError('This invitation is no longer available.', 409);
  const project = db.projects.find((p) => p.id === invitation.projectId);
  invitation.status = body.accept ? 'accepted' : 'declined';
  n.read = true;
  if (body.accept) {
    project.memberIds.push(user.id);
    log(db, project.id, user.id, 'accepted the invitation and joined the team');
  }
  return { projectId: project.id, accepted: Boolean(body.accept) };
});

// ---------- Search & supervisor ----------
route('GET', '/search', ({ db, user, query }) => {
  const q = (query.q || '').trim().toLowerCase();
  const result = { projects: [], tasks: [], milestones: [], members: [] };
  if (q.length < 2) return result;
  const match = (...values) => values.some((v) => (v || '').toLowerCase().includes(q));
  const seen = new Set();
  db.projects.filter((p) => canAccess(p, user)).forEach((p) => {
    if (match(p.title, p.description)) result.projects.push({ id: p.id, projectId: p.id, title: p.title, subtitle: userById(db, p.supervisorId)?.fullName });
    db.tasks.filter((t) => t.projectId === p.id && match(t.title, t.description)).forEach((t) => result.tasks.push({ id: t.id, projectId: p.id, title: t.title, subtitle: p.title }));
    db.milestones.filter((m) => m.projectId === p.id && match(m.name, m.description)).forEach((m) => result.milestones.push({ id: m.id, projectId: p.id, title: m.name, subtitle: p.title }));
    p.memberIds.map((id) => userById(db, id)).filter((u) => match(u.fullName, u.email)).forEach((u) => {
      if (!seen.has(`${u.id}-${p.id}`)) {
        seen.add(`${u.id}-${p.id}`);
        result.members.push({ id: `${u.id}-${p.id}`, projectId: p.id, title: u.fullName, subtitle: p.title });
      }
    });
  });
  Object.keys(result).forEach((k) => { result[k] = result[k].slice(0, 5); });
  return result;
});

route('GET', '/supervisor/activity', ({ db, user }) => {
  if (user.role !== 'supervisor') throw new ApiError('Supervisor access only.', 403);
  const mine = db.projects.filter((p) => p.supervisorId === user.id);
  return db.history
    .filter((h) => mine.some((p) => p.id === h.projectId))
    .map((h) => ({ ...h, actorName: userById(db, h.actorId)?.fullName, projectTitle: mine.find((p) => p.id === h.projectId).title }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
});

function requireUser(db, token) {
  const id = token?.startsWith('mock.') ? token.slice(5) : null;
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError('Your session has expired. Sign in again.', 401);
  return user;
}

export async function handleMockRequest(method, fullPath, body, token) {
  if (MOCK_LATENCY > 0) await delay(MOCK_LATENCY);
  const url = new URL(fullPath, 'http://mock.local');
  const query = Object.fromEntries(url.searchParams);
  const db = loadDb();

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = url.pathname.match(r.regex);
    if (!match) continue;
    const user = r.open ? null : requireUser(db, token);
    const result = r.handler({ db, user, params: match.groups || {}, query, body: body || {} });
    persist();
    if (result instanceof Blob || result == null) return result ?? null;
    return JSON.parse(JSON.stringify(result));
  }
  throw new ApiError('Endpoint not found.', 404);
}
