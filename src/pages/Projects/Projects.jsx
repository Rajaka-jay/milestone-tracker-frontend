import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, LayoutGrid, List, Plus } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { projectsApi } from '../../services/api';
import { PROJECT_FILTERS } from '../../utils/constants';
import { projectProgress, projectStatus } from '../../utils/progress';
import { formatDate } from '../../utils/dates';
import { PageLoader, ErrorState, EmptyState, PageHeader, SegmentedControl, AvatarStack, ProjectStatusBadge } from '../../components/ui';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ProjectFormModal from '../../components/forms/ProjectFormModal';

const VIEWS = [
  { value: 'cards', label: 'Cards', icon: LayoutGrid },
  { value: 'table', label: 'Table', icon: List },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => projectsApi.list(), []);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('cards');
  const [creating, setCreating] = useState(false);

  if (loading && !data) return <PageLoader />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  const projects = data ?? [];
  const visible = projects.filter((p) => filter === 'all' || projectStatus(p) === filter);
  const counts = (value) => (value === 'all' ? projects.length : projects.filter((p) => projectStatus(p) === value).length);

  return (
    <div className="page">
      <PageHeader
        title="My Projects"
        subtitle="Every project you lead or contribute to."
        actions={<button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> New project</button>}
      />

      <div className="toolbar toolbar--between">
        <SegmentedControl label="Filter projects" value={filter} onChange={setFilter} options={PROJECT_FILTERS.map((f) => ({ ...f, count: counts(f.value) }))} />
        <SegmentedControl label="Change layout" value={view} onChange={setView} options={VIEWS} />
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            message="Start a project and invite your team, or wait for an invitation to appear in the notification bell."
            action={<button type="button" className="btn btn--primary" onClick={() => setCreating(true)}><Plus size={17} /> New project</button>}
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="card"><EmptyState compact title="No projects match this filter" message="Choose another filter to see the rest of your projects." /></div>
      ) : view === 'cards' ? (
        <div className="grid grid--cards">{visible.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
      ) : (
        <div className="card card--flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Project</th><th>Supervisor</th><th>Members</th><th className="col-progress">Progress</th><th>Deadline</th><th>Status</th></tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td><Link className="table__link" to={`/projects/${p.id}`}>{p.title}</Link></td>
                    <td>{p.supervisor?.fullName}</td>
                    <td><AvatarStack people={p.members} max={3} /></td>
                    <td className="col-progress"><ProgressBar value={projectProgress(p)} size="sm" label={`${p.title} progress`} /></td>
                    <td>{formatDate(p.endDate)}</td>
                    <td><ProjectStatusBadge status={projectStatus(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {creating && <ProjectFormModal onClose={() => setCreating(false)} onCreated={(p) => navigate(`/projects/${p.id}`)} />}
    </div>
  );
}
