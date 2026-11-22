
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
  Store,
  Bike,
  SlidersHorizontal,
} from 'lucide-react';

import type { UserRole } from '../../../types/global.types';

import {
  AuthAside,
  AuthMobileLogo,
} from '../../../components/shared/AuthAside';

const DEMO_ACCOUNTS: {
  role: UserRole;
  email: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    role: 'customer',
    email: 'customer@demo.com',
    label: 'Customer',
    icon: <ShoppingBag size={16} />,
  },
  {
    role: 'merchant',
    email: 'merchant@demo.com',
    label: 'Merchant',
    icon: <Store size={16} />,
  },
  {
    role: 'courier',
    email: 'courier@demo.com',
    label: 'Courier',
    icon: <Bike size={16} />,
  },
  {
    role: 'dispatcher',
    email: 'dispatcher@demo.com',
    label: 'Dispatcher',
    icon: <SlidersHorizontal size={16} />,
  },
  {
    role: 'admin',
    email: 'admin@demo.com',
    label: 'Admin',
    icon: <Lock size={16} />,
  },
];

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    const redirects: Record<string, string> = {
      customer: '/customer',
      merchant: '/merchant',
      courier: '/courier',
      dispatcher: '/dispatcher',
      admin: '/admin/merchants',
    };

    return <Navigate to={redirects[user.role] ?? '/'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error ?? 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthAside
        headline={
          <>
            Every parcel,
            <br />
            <span>accounted</span>
            <br />
            for.
          </>
        }
        lead="Sign in to book, dispatch, deliver and track — one console for the whole delivery chain."
      />

      <main className="auth-main">
        <div className="auth-box">
          <AuthMobileLogo />

          <p
            className="eyebrow"
            style={{ marginBottom: 14, color: 'var(--signal)' }}
          >
            Sign in
          </p>

          <h1 className="auth-title">Welcome back</h1>

          <p className="auth-subtitle">
            Sign in to your SwiftDrop account
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>

              <div className="form-input-icon">
                <Mail className="icon" size={16} />

                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>

              <div
                className="form-input-icon"
                style={{ position: 'relative' }}
              >
                <Lock className="icon" size={16} />

                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      width: 16,
                      height: 16,
                      borderWidth: 2,
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}
          >
            <p
              className="form-label"
              style={{ marginBottom: 12 }}
            >
              Quick Demo Access
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setError('');
                  }}
                  className="btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {account.icon}
                  <span>{account.label}</span>
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 10,
                textAlign: 'center',
              }}
            >
              Select a role to fill its demo email address.
            </p>
          </div>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
