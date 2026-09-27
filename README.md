# Student Project Milestone Tracker: Frontend

React frontend for the Student Project Milestone Tracker. Students create projects, invite teammates, plan milestones and tasks (Kanban and list views), share documents and follow progress. Supervisors monitor assigned projects and leave feedback.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173, uses the built-in mock backend
```

`.env.development` sets `VITE_USE_MOCK=true`, so the app works immediately with demo data and no server.

| Demo account | Email | Password |
| --- | --- | --- |
| Student | `amina@student.edu` | `password123` |
| Supervisor | `supervisor@uni.edu` | `password123` |

Demo data lives in the browser's localStorage. Clear site data to reset it.

## Connecting to the real backend

Copy `.env.example` to `.env.local` and set:

```
VITE_API_URL=http://localhost:4000/api
VITE_USE_MOCK=false
```

Every HTTP call goes through `src/services/http.js` and `src/services/api.js`. Components never call `fetch` directly. The bearer token is stored and attached centrally, and a `401` response signs the user out.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run lint` | ESLint (runs in CI) |
| `npm test` | Vitest unit and integration tests (runs in CI) |
| `npm run build` | Production build into `dist/` |
| `npm run ci` | Lint, test and build in one go |

## Docker

```bash
docker build -t milestone-tracker-frontend --build-arg VITE_API_URL=/api .
docker run -p 8080:80 milestone-tracker-frontend
```

`nginx.conf` serves the SPA with an `index.html` fallback. Uncomment the `/api/` block to proxy to your backend container. API configuration is injected at build time with `VITE_*` variables.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request: `npm ci`, lint, tests, production build (uploaded as an artifact) and a Docker image build.

## Project structure

```
src/
  components/   Navbar, Sidebar, NotificationBell, GlobalSearch, ProjectCard, ProgressBar,
                TaskCard, KanbanBoard, TaskTable, MilestoneCard, TeamMemberCard,
                DocumentCard, Modal, Charts, forms/, ui/
  pages/        Login, Register, ForgotPassword, Dashboard, Projects, ProjectDetails,
                Milestones, Tasks, Team, Documents, SupervisorDashboard, Profile
  services/     http.js (fetch wrapper), api.js (endpoints), mock/ (in-browser fake backend)
  context/      AuthContext, ToastContext
  hooks/        useFetch, useNotifications, useDebounce, useDismiss, useProjectContext
  layouts/      AppLayout (sidebar + top bar), AuthLayout
  routes/       ProtectedRoute (role-aware)
  utils/        progress calculations, dates, validators, constants
  styles/       base, layout, components, pages
```

## Routes

| Path | Who | Page |
| --- | --- | --- |
| `/login`, `/register`, `/forgot-password` | Anyone signed out | Authentication |
| `/auth/callback?token=` | Anyone | Google OAuth return |
| `/dashboard` | Student | Dashboard with filters and charts |
| `/projects` | Student | My Projects (cards or table) |
| `/join/:token` | Student | Join through an invitation link |
| `/projects/:id` (+ `milestones`, `tasks`, `team`, `documents`) | Members and the assigned supervisor | Project workspace |
| `/supervisor` | Supervisor | Supervisor dashboard |
| `/profile` | Any user | Settings / Profile |

## REST API contract expected from the backend

All endpoints are relative to `VITE_API_URL`, send `Authorization: Bearer <token>`, and return JSON. Errors use `{ "message": "...", "errors": { "field": "..." } }` with the matching HTTP status (`errors` is optional and maps to form fields).

| Method and path | Purpose | Response |
| --- | --- | --- |
| `POST /auth/login` `{email,password}` | Email login | `{token,user}` |
| `POST /auth/register` `{fullName,email,password,role}` | Register (`student` or `supervisor`) | `{token,user}` |
| `GET /auth/google` | Starts Google OAuth, redirects to `/auth/callback?token=` | redirect |
| `POST /auth/forgot-password` `{email}` | Send reset link | `{message}` |
| `GET /auth/me`, `PATCH /auth/me` `{fullName}` | Current user | `user` |
| `GET /users/supervisors` | Supervisor list for the project form | `user[]` |
| `GET /users/students?q=&projectId=` | Search students (excluding members and pending invites) | `user[]` |
| `GET /projects` | Projects visible to the user (members, or assigned supervisor) | `project[]` |
| `POST /projects` `{title,description,supervisorId,startDate,endDate,inviteeIds}` | Create project, caller becomes leader | `project` |
| `GET /projects/:id` | Full project | `project` |
| `GET /projects/:id/invite-link` | Invitation token (leader/members) | `{token}` |
| `POST /projects/join` `{token}` | Join through link | `project` |
| `POST /projects/:id/invitations` `{studentId}` | Invite a student | `{ok}` |
| `POST /projects/:id/milestones` | Create milestone `{name,description,startDate,deadline}` | `milestone` |
| `POST /projects/:id/tasks` | Create task `{title,description,milestoneId,assigneeId,deadline,priority,status}` | `task` |
| `PATCH /tasks/:id` | Update any task field, including `status` | `task` |
| `POST /projects/:id/documents` (multipart `file`) | Upload PDF, Word or PowerPoint | `document` |
| `DELETE /documents/:id` | Delete document | `204` |
| `GET /documents/:id/download` | File stream | binary |
| `POST /projects/:id/feedback` `{message}` | Supervisor feedback | `feedback` |
| `GET /notifications` | Notifications for the user (`invitationStatus` for invitations) | `notification[]` |
| `POST /notifications/:id/read`, `POST /notifications/read-all` | Mark as read | `{ok}` |
| `POST /notifications/:id/respond` `{accept}` | Accept or decline an invitation | `{projectId,accepted}` |
| `GET /search?q=` | Global search | `{projects,milestones,tasks,members}` (each item `{id,projectId,title,subtitle}`) |
| `GET /supervisor/activity` | Latest history across the supervisor's projects | `history[]` |

A `project` includes `supervisor`, `members` (each with `projectRole: "leader" | "member"`), `pendingInvites`, `milestones`, `tasks`, `documents` (with `uploadedBy`), `feedback` (with `supervisorName`) and `history` (with `actorName`). The frontend derives progress and status (active, completed, overdue) from task statuses and dates. See `src/services/mock/server.js` for a working reference implementation of every endpoint.

Dates are `YYYY-MM-DD`. Timestamps are ISO 8601. Task `status` is `todo`, `in_progress` or `done`; `priority` is `low`, `medium` or `high`.

## Scope notes

Following the requirements: light theme only, no separate task-filtering system, no team-member removal, no dedicated notifications page (the bell dropdown handles them), and supervisors have read and feedback access only.
