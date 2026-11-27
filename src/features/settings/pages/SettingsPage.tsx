import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useAuth } from '../../auth/context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <DashboardLayout title="Settings">
      <section className="card" style={{ maxWidth: 640 }}>
        <h1 className="page-title">Account settings</h1>
        <p className="page-subtitle">Signed-in identity for this session.</p>
        <dl className="settings-facts">
          <div>
            <dt>Name</dt>
            <dd>{user?.name || 'Not available'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || 'Not available'}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role || 'Not available'}</dd>
          </div>
        </dl>
        <button type="button" className="btn btn-outline" onClick={signOut}>
          Sign out
        </button>
      </section>
    </DashboardLayout>
  );
};

export default SettingsPage;
