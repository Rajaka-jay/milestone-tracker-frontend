import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader, ErrorState } from '../../components/ui';

/** Opened from an invitation link: /join/:token */
export default function JoinProjectPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    projectsApi.join(token)
      .then((project) => {
        toast.success(`You are now a member of "${project.title}".`);
        navigate(`/projects/${project.id}`, { replace: true });
      })
      .catch(setError);
  }, [token, navigate, toast]);

  if (error) {
    return (
      <div className="page">
        <ErrorState title="This invitation could not be used" error={error} />
        <p className="center"><Link to="/projects" className="link">Go to My Projects</Link></p>
      </div>
    );
  }
  return <PageLoader label="Joining project…" />;
}
