import { request } from './http';

export const authApi = {
  login: (email, password) => request('POST', '/auth/login', { body: { email, password } }),
  register: (payload) => request('POST', '/auth/register', { body: payload }),
  google: () => request('POST', '/auth/google'),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { body: { email } }),
  me: () => request('GET', '/auth/me'),
  updateProfile: (body) => request('PATCH', '/auth/me', { body }),
};

export const usersApi = {
  supervisors: () => request('GET', '/users/supervisors'),
  searchStudents: (q, projectId) => request('GET', '/users/students', { params: { q, projectId } }),
};

export const projectsApi = {
  list: () => request('GET', '/projects'),
  get: (id) => request('GET', `/projects/${id}`),
  create: (body) => request('POST', '/projects', { body }),
  invite: (id, studentId) => request('POST', `/projects/${id}/invitations`, { body: { studentId } }),
  inviteLink: (id) => request('GET', `/projects/${id}/invite-link`),
  join: (token) => request('POST', '/projects/join', { body: { token } }),
  activity: () => request('GET', '/supervisor/activity'),
};

export const milestonesApi = {
  create: (projectId, body) => request('POST', `/projects/${projectId}/milestones`, { body }),
};

export const tasksApi = {
  create: (projectId, body) => request('POST', `/projects/${projectId}/tasks`, { body }),
  update: (id, body) => request('PATCH', `/tasks/${id}`, { body }),
};

export const documentsApi = {
  upload: (projectId, file) => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', `/projects/${projectId}/documents`, { body: form });
  },
  remove: (id) => request('DELETE', `/documents/${id}`),
  download: (id) => request('GET', `/documents/${id}/download`, { responseType: 'blob' }),
};

export const feedbackApi = {
  create: (projectId, message) => request('POST', `/projects/${projectId}/feedback`, { body: { message } }),
};

export const notificationsApi = {
  list: () => request('GET', '/notifications'),
  markRead: (id) => request('POST', `/notifications/${id}/read`),
  markAllRead: () => request('POST', '/notifications/read-all'),
  respond: (id, accept) => request('POST', `/notifications/${id}/respond`, { body: { accept } }),
};

export const searchApi = {
  all: (q) => request('GET', '/search', { params: { q } }),
};
