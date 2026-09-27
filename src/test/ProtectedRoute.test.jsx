import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';

const auth = { user: null, loading: false };
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route path="/dashboard" element={<p>Student dashboard</p>} />
        <Route element={<ProtectedRoute roles={['supervisor']} />}>
          <Route path="/supervisor" element={<p>Supervisor dashboard</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects visitors who are not signed in to the login page', () => {
    Object.assign(auth, { user: null, loading: false });
    renderAt('/supervisor');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('keeps students out of supervisor pages', () => {
    Object.assign(auth, { user: { id: 'u1', role: 'student' }, loading: false });
    renderAt('/supervisor');
    expect(screen.getByText('Student dashboard')).toBeInTheDocument();
  });

  it('lets supervisors in', () => {
    Object.assign(auth, { user: { id: 's1', role: 'supervisor' }, loading: false });
    renderAt('/supervisor');
    expect(screen.getByText('Supervisor dashboard')).toBeInTheDocument();
  });
});
