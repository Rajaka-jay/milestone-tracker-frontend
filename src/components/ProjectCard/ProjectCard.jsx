import { Link } from 'react-router-dom';
import { GraduationCap, Calendar } from 'lucide-react';
import { projectProgress, projectStatus } from '../../utils/progress';
import { deadlineLabel, formatDate } from '../../utils/dates';
import ProgressBar from '../ProgressBar/ProgressBar';
import { AvatarStack, ProjectStatusBadge } from '../ui';

export default function ProjectCard({ project }) {
  const status = projectStatus(project);
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__top">
        <h3 className="project-card__title">{project.title}</h3>
        <ProjectStatusBadge status={status} />
      </div>
      <p className="project-card__supervisor"><GraduationCap size={15} /> {project.supervisor?.fullName}</p>
      <ProgressBar value={projectProgress(project)} label={`${project.title} progress`} />
      <div className="project-card__foot">
        <span className="project-card__members">
          <AvatarStack people={project.members} />
          <span>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
        </span>
        <span className={`project-card__deadline ${status === 'overdue' ? 'is-overdue' : ''}`}>
          <Calendar size={14} /> {formatDate(project.endDate)}
          {status === 'active' && <small>{deadlineLabel(project.endDate)}</small>}
        </span>
      </div>
    </Link>
  );
}
