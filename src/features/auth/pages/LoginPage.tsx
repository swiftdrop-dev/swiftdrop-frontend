import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, ShoppingBag, Store, Bike, SlidersHorizontal } from 'lucide-react';
import { AuthAside, AuthMobileLogo } from '../../../components/shared/AuthAside';
import type { UserRole } from '../../../types/global.types';

const DEMO_ACCOUNTS: { role: UserRole; email: string; label: string; icon: React.ReactNode }[] = [
  { role: 'customer', email: 'customer@demo.com', label: 'Customer', icon: <ShoppingBag /> },
  { role: 'merchant', email: 'merchant@demo.com', label: 'Merchant', icon: <Store /> },
  { role: 'courier', email: 'courier@demo.com', label: 'Courier', icon: <Bike /> },
  { role: 'dispatcher', email: 'dispatcher@demo.com', label: 'Dispatcher', icon: <SlidersHorizontal /> },
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
    };
    return <Navigate to={redirects[user.role] ?? '/'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed');
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="auth-page">
      <AuthAside
        headline={<>Every parcel,<br /><span>accounted</span><br />for.</>}
        lead="Sign in to book, dispatch, deliver and track — one console for the whole delivery chain."
      />
      <main className="auth-main">
      <div className="auth-box">
        <AuthMobileLogo />
        <p className="eyebrow" style={{ marginBottom: 14, color: 'var(--signal)' }}>Sign in</p>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your SwiftDrop account</p>

        {/* Demo Quick Login */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} /> Quick demo login
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => quickLogin(acc.email)}
                className={`role-pick ${email === acc.email ? 'selected' : ''}`}
              >
                {acc.icon}
                <span>{acc.label}</span>
                <small>0{i + 1}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-divider"><span>or sign in manually</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="form-input-icon">
              <Mail className="icon" size={16} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-input-icon" style={{ position: 'relative' }}>
              <Lock className="icon" size={16} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 40 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', padding: 0,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

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
