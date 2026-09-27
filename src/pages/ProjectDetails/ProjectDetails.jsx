import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { projectsApi } from '../../services/api';
import { formatDate } from '../../utils/dates';
import { projectProgress, projectStatus } from '../../utils/progress';
import { PageLoader, ErrorState, ProjectStatusBadge } from '../../components/ui';
import ProgressBar from '../../components/ProgressBar/ProgressBar';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { data: project, loading, error, reload, setData } = useFetch(() => projectsApi.get(projectId), [projectId]);

  if (loading && !project) return <PageLoader label="Loading project…" />;
  if (error && !project) {
    return (
      <div className="page">
        <ErrorState title="This project could not be opened" error={error} onRetry={reload} />
      </div>
    );
  }
  if (!project) return null;

  const isSupervisor = user.role === 'supervisor';
  const canManage = !isSupervisor && project.members.some((m) => m.id === user.id);
  const backTo = isSupervisor ? '/supervisor' : '/projects';

  const patchTask = (taskId, patch) => setData((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }));

  const tabs = [
    { to: '', label: 'Overview', end: true },
    { to: 'milestones', label: 'Milestones', count: project.milestones.length },
    { to: 'tasks', label: 'Tasks', count: project.tasks.length },
    { to: 'team', label: 'Team', count: project.members.length },
    { to: 'documents', label: 'Documents', count: project.documents.length },
  ];

  return (
    <div className="page">
      <Link to={backTo} className="back-link"><ArrowLeft size={16} /> {isSupervisor ? 'Dashboard' : 'My Projects'}</Link>

      <header className="project-head">
        <div className="project-head__main">
          <div className="project-head__title">
            <h1 className="page-title">{project.title}</h1>
            <ProjectStatusBadge status={projectStatus(project)} />
          </div>
          <ul className="meta">
            <li><GraduationCap size={16} /> {project.supervisor?.fullName}</li>
            <li><Calendar size={16} /> {formatDate(project.startDate)} to {formatDate(project.endDate)}</li>
            <li><Users size={16} /> {project.members.length} {project.members.length === 1 ? 'member' : 'members'}</li>
          </ul>
        </div>
        <div className="project-head__progress">
          <span className="project-head__progress-label">Overall progress</span>
          <ProgressBar value={projectProgress(project)} label="Overall project progress" />
        </div>
      </header>

      <nav className="tabs" aria-label="Project sections">
        {tabs.map((t) => (
          <NavLink key={t.label} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? 'is-active' : ''}`}>
            {t.label}
            {t.count !== undefined && <span className="tab__count">{t.count}</span>}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ project, user, canManage, isSupervisor, reload, patchTask }} />
    </div>
  );
}
