import { ACCEPTED_EXTENSIONS, MAX_UPLOAD_MB } from './constants';

export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address, like name@university.edu.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateRegister({ fullName, email, password, confirmPassword, role }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address, like name@university.edu.';
  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8) errors.password = 'Use at least 8 characters.';
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  if (!['student', 'supervisor'].includes(role)) errors.role = 'Choose a role.';
  return errors;
}

export function validateProject({ title, description, supervisorId, startDate, endDate }) {
  const errors = {};
  if (!title.trim()) errors.title = 'Enter a project title.';
  if (!description.trim()) errors.description = 'Add a short description.';
  if (!supervisorId) errors.supervisorId = 'Select a supervisor.';
  if (!startDate) errors.startDate = 'Choose a start date.';
  if (!endDate) errors.endDate = 'Choose an end date.';
  else if (startDate && endDate < startDate) errors.endDate = 'End date must be after the start date.';
  return errors;
}

export function validateMilestone({ name, startDate, deadline }, project) {
  const errors = {};
  if (!name.trim()) errors.name = 'Enter a milestone name.';
  if (!startDate) errors.startDate = 'Choose a start date.';
  if (!deadline) errors.deadline = 'Choose a deadline.';
  else if (startDate && deadline < startDate) errors.deadline = 'Deadline must be after the start date.';
  else if (project && deadline > project.endDate) errors.deadline = 'Deadline is after the project end date.';
  return errors;
}

export function validateTask({ title, milestoneId, assigneeId, deadline }) {
  const errors = {};
  if (!title.trim()) errors.title = 'Enter a task title.';
  if (!milestoneId) errors.milestoneId = 'Select a milestone.';
  if (!assigneeId) errors.assigneeId = 'Assign the task to a team member.';
  if (!deadline) errors.deadline = 'Choose a deadline.';
  return errors;
}

export function validateFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) return 'Only PDF, Word and PowerPoint files can be uploaded.';
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `Files must be smaller than ${MAX_UPLOAD_MB} MB.`;
  return null;
}
