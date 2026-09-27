import { useProjectContext } from '../../hooks/useProjectContext';
import TeamMemberCard from '../../components/TeamMemberCard/TeamMemberCard';
import { Avatar, Badge } from '../../components/ui';
import InvitePanel from './InvitePanel';

export default function TeamTab() {
  const { project, user, canManage, reload } = useProjectContext();
  return (
    <div className="tab-panel">
      <div className="tab-panel__head">
        <div>
          <h2 className="section__title">Team</h2>
          <p className="muted">Members, their roles and how much of their assigned work is finished.</p>
        </div>
      </div>

      <div className="grid grid--cards">
        {project.members.map((m) => <TeamMemberCard key={m.id} member={m} tasks={project.tasks} isYou={m.id === user.id} />)}
      </div>

      {project.pendingInvites.length > 0 && (
        <section className="card">
          <header className="card__header"><h2 className="card__title">Pending invitations</h2></header>
          <ul className="people people--rows">
            {project.pendingInvites.map((i) => (
              <li key={i.id}>
                <Avatar name={i.user.fullName} size="sm" />
                <span>{i.user.fullName}</span>
                <Badge tone="amber">Awaiting reply</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canManage && <InvitePanel project={project} onInvited={() => reload({ silent: true })} />}
    </div>
  );
}
