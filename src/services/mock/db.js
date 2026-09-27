import { toISODate } from '../../utils/dates';

// In-browser stand-in for the PostgreSQL database, persisted to localStorage.
const KEY = 'smt_mock_db_v1';
let memory = null;

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d);
};
const at = (offsetDays, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

function seed() {
  const pw = 'password123';
  const users = [
    { id: 'u1', fullName: 'Amina Yusuf', email: 'amina@student.edu', password: pw, role: 'student' },
    { id: 'u2', fullName: 'Daniel Okoro', email: 'daniel@student.edu', password: pw, role: 'student' },
    { id: 'u3', fullName: 'Priya Nair', email: 'priya@student.edu', password: pw, role: 'student' },
    { id: 'u4', fullName: 'Lucas Meyer', email: 'lucas@student.edu', password: pw, role: 'student' },
    { id: 'u5', fullName: 'Sofia Rossi', email: 'sofia@student.edu', password: pw, role: 'student' },
    { id: 'u6', fullName: 'Chen Wei', email: 'chen@student.edu', password: pw, role: 'student' },
    { id: 's1', fullName: 'Dr. Helen Carter', email: 'supervisor@uni.edu', password: pw, role: 'supervisor' },
    { id: 's2', fullName: 'Prof. Marcus Bell', email: 'marcus.bell@uni.edu', password: pw, role: 'supervisor' },
  ];

  const projects = [
    { id: 'p1', title: 'Smart Campus Energy Monitor', description: 'A web dashboard that collects electricity readings from campus buildings and highlights unusual consumption so facilities staff can react quickly.', leaderId: 'u1', supervisorId: 's1', memberIds: ['u1', 'u2', 'u3'], startDate: day(-60), endDate: day(45), createdAt: at(-61) },
    { id: 'p2', title: 'Library Room Booking System', description: 'Students reserve study rooms online, receive confirmation emails and see live availability across all library floors.', leaderId: 'u2', supervisorId: 's2', memberIds: ['u2', 'u1', 'u4'], startDate: day(-90), endDate: day(-3), createdAt: at(-91) },
    { id: 'p3', title: 'Alumni Mentorship Portal', description: 'A matching platform that connects graduating students with alumni mentors based on field and interests.', leaderId: 'u1', supervisorId: 's1', memberIds: ['u1', 'u5'], startDate: day(-150), endDate: day(-40), createdAt: at(-151) },
    { id: 'p4', title: 'Campus Navigation App', description: 'Indoor and outdoor wayfinding for new students, including accessible routes and lecture hall search.', leaderId: 'u3', supervisorId: 's1', memberIds: ['u3', 'u4', 'u5', 'u6'], startDate: day(-30), endDate: day(70), createdAt: at(-31) },
  ];

  const M = (id, projectId, name, description, startDate, deadline) => ({ id, projectId, name, description, startDate, deadline });
  const milestones = [
    M('m1', 'p1', 'Requirements and research', 'Gather needs from facilities staff and agree the scope.', day(-60), day(-35)),
    M('m2', 'p1', 'System design', 'Database schema, wireframes and API contract.', day(-34), day(-8)),
    M('m3', 'p1', 'Prototype development', 'Working ingestion service and dashboard.', day(-7), day(20)),
    M('m4', 'p1', 'Testing and deployment', 'Automated tests and staging release.', day(21), day(45)),
    M('m5', 'p2', 'Planning', 'Charter, scope and room inventory.', day(-90), day(-70)),
    M('m6', 'p2', 'Implementation', 'Availability API, booking UI and email service.', day(-69), day(-10)),
    M('m7', 'p2', 'User testing', 'Usability sessions and final report.', day(-9), day(-3)),
    M('m8', 'p3', 'Discovery', 'Interview alumni and define the matching rules.', day(-150), day(-100)),
    M('m9', 'p3', 'Delivery', 'Build, test and hand over the portal.', day(-99), day(-40)),
    M('m10', 'p4', 'Research', 'Survey students and audit existing campus maps.', day(-30), day(-5)),
    M('m11', 'p4', 'Prototype', 'Clickable route planner.', day(-4), day(40)),
  ];

  const T = (id, projectId, milestoneId, title, assigneeId, deadline, priority, status, description = '') =>
    ({ id, projectId, milestoneId, title, description, assigneeId, deadline, priority, status });
  const tasks = [
    T('t1', 'p1', 'm1', 'Interview facilities staff', 'u1', day(-50), 'medium', 'done', 'Record needs from the estates team.'),
    T('t2', 'p1', 'm1', 'Write requirements specification', 'u2', day(-40), 'high', 'done'),
    T('t3', 'p1', 'm2', 'Design database schema', 'u3', day(-25), 'high', 'done'),
    T('t4', 'p1', 'm2', 'Create UI wireframes', 'u1', day(-15), 'medium', 'done'),
    T('t5', 'p1', 'm2', 'Define REST API contract', 'u2', day(-2), 'high', 'in_progress', 'Document every endpoint including error responses.'),
    T('t6', 'p1', 'm3', 'Build sensor data ingestion service', 'u3', day(6), 'high', 'in_progress'),
    T('t7', 'p1', 'm3', 'Implement dashboard charts', 'u1', day(9), 'medium', 'in_progress'),
    T('t8', 'p1', 'm3', 'Set up GitHub Actions pipeline', 'u2', day(3), 'medium', 'todo'),
    T('t9', 'p1', 'm4', 'Write integration tests', 'u3', day(30), 'low', 'todo'),
    T('t10', 'p1', 'm4', 'Deploy to staging server', 'u1', day(40), 'high', 'todo'),
    T('t11', 'p2', 'm5', 'Draft project charter', 'u2', day(-80), 'medium', 'done'),
    T('t12', 'p2', 'm6', 'Room availability API', 'u4', day(-40), 'high', 'done'),
    T('t13', 'p2', 'm6', 'Booking calendar interface', 'u1', day(-6), 'high', 'in_progress'),
    T('t14', 'p2', 'm6', 'Email confirmation service', 'u2', day(-4), 'medium', 'in_progress'),
    T('t15', 'p2', 'm7', 'Run usability sessions', 'u1', day(-3), 'medium', 'todo'),
    T('t16', 'p2', 'm7', 'Write final report', 'u4', day(-3), 'low', 'todo'),
    T('t17', 'p3', 'm8', 'Interview five alumni', 'u1', day(-120), 'medium', 'done'),
    T('t18', 'p3', 'm8', 'Define matching rules', 'u5', day(-105), 'high', 'done'),
    T('t19', 'p3', 'm9', 'Build mentor profile pages', 'u1', day(-70), 'medium', 'done'),
    T('t20', 'p3', 'm9', 'Hand over to careers office', 'u5', day(-42), 'low', 'done'),
    T('t21', 'p4', 'm10', 'Survey new students', 'u4', day(-12), 'medium', 'done'),
    T('t22', 'p4', 'm10', 'Audit existing campus maps', 'u5', day(-8), 'low', 'done'),
    T('t23', 'p4', 'm11', 'Design route planner screens', 'u3', day(10), 'high', 'in_progress'),
    T('t24', 'p4', 'm11', 'Model accessible routes', 'u6', day(18), 'high', 'todo'),
    T('t25', 'p4', 'm11', 'Lecture hall search', 'u4', day(25), 'medium', 'todo'),
  ];

  const D = (id, projectId, name, type, size, uploadedById, uploadedAt) => ({ id, projectId, name, type, size, uploadedById, uploadedAt });
  const documents = [
    D('d1', 'p1', 'Requirements Specification.pdf', 'PDF', 482113, 'u2', at(-40, 14)),
    D('d2', 'p1', 'System Architecture.pptx', 'PowerPoint', 2310450, 'u3', at(-22, 11)),
    D('d3', 'p1', 'Interview Notes.docx', 'Word', 96210, 'u1', at(-49, 16)),
    D('d4', 'p2', 'Project Charter.docx', 'Word', 84120, 'u2', at(-80, 9)),
    D('d5', 'p3', 'Final Report.pdf', 'PDF', 1284002, 'u1', at(-41, 15)),
  ];

  const feedback = [
    { id: 'f1', projectId: 'p1', supervisorId: 's1', message: 'Good progress on the requirements. Make sure the API contract covers error responses before implementation starts.', createdAt: at(-20, 15) },
    { id: 'f2', projectId: 'p3', supervisorId: 's1', message: 'Excellent delivery. The handover documentation is clear and the careers office can maintain this without help.', createdAt: at(-38, 11) },
    { id: 'f3', projectId: 'p2', supervisorId: 's2', message: 'The booking interface is behind schedule. Please agree a recovery plan with your team this week.', createdAt: at(-5, 10) },
  ];

  const H = (id, projectId, actorId, message, createdAt) => ({ id, projectId, actorId, message, createdAt });
  const history = [
    H('h1', 'p1', 'u1', 'created the project', at(-61)),
    H('h2', 'p1', 'u1', 'added milestone "Requirements and research"', at(-60, 9)),
    H('h3', 'p1', 'u2', 'marked "Write requirements specification" as Done', at(-40, 13)),
    H('h4', 'p1', 's1', 'left feedback', at(-20, 15)),
    H('h5', 'p1', 'u1', 'marked "Create UI wireframes" as Done', at(-15, 10)),
    H('h6', 'p1', 'u2', 'uploaded System Architecture.pptx', at(-22, 11)),
    H('h7', 'p2', 'u2', 'created the project', at(-91)),
    H('h8', 'p2', 's2', 'left feedback', at(-5, 10)),
    H('h9', 'p3', 'u1', 'marked "Hand over to careers office" as Done', at(-42, 10)),
    H('h10', 'p4', 'u3', 'created the project', at(-31)),
    H('h11', 'p4', 'u4', 'marked "Survey new students" as Done', at(-12, 12)),
  ];

  const invitations = [{ id: 'i1', projectId: 'p4', inviterId: 'u3', inviteeId: 'u1', status: 'pending' }];

  const notifications = [
    { id: 'n1', userId: 'u1', type: 'invitation', message: 'Priya Nair invited you to join "Campus Navigation App".', projectId: 'p4', invitationId: 'i1', read: false, createdAt: at(0, 8) },
    { id: 'n2', userId: 'u1', type: 'deadline', message: '"Set up GitHub Actions pipeline" is due in 3 days.', projectId: 'p1', read: false, createdAt: at(0, 7) },
    { id: 'n3', userId: 'u1', type: 'deadline', message: '"Booking calendar interface" is 6 days overdue.', projectId: 'p2', read: true, createdAt: at(-1, 9) },
    { id: 'n4', userId: 'u1', type: 'feedback', message: 'Prof. Marcus Bell left feedback on "Library Room Booking System".', projectId: 'p2', read: true, createdAt: at(-5, 10) },
  ];

  return { users, projects, milestones, tasks, documents, feedback, history, invitations, notifications, seq: 1000 };
}

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch { /* storage unavailable */ }
}

export function loadDb() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { memory = JSON.parse(raw); return memory; }
  } catch { /* fall through to seed */ }
  memory = seed();
  persist();
  return memory;
}

export function resetDb() {
  memory = null;
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  return loadDb();
}

export function nextId(prefix) {
  const db = loadDb();
  db.seq += 1;
  return `${prefix}${db.seq}`;
}
