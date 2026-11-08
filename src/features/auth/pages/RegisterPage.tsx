import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ShoppingBag, Store, Bike, SlidersHorizontal } from 'lucide-react';
import { AuthAside, AuthMobileLogo } from '../../../components/shared/AuthAside';
import type { UserRole } from '../../../types/global.types';

const ROLES: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'customer', label: 'Customer', icon: <ShoppingBag /> },
  { value: 'merchant', label: 'Merchant', icon: <Store /> },
  { value: 'courier', label: 'Courier', icon: <Bike /> },
  { value: 'dispatcher', label: 'Dispatcher', icon: <SlidersHorizontal /> },
];

const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' as UserRole });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    const redirects: Record<string, string> = {
      customer: '/customer', merchant: '/merchant',
      courier: '/courier', dispatcher: '/dispatcher',
    };
    return <Navigate to={redirects[user.role] ?? '/'} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Registration failed');
  };

  return (
    <div className="auth-page">
      <AuthAside
        headline={<>Open your<br /><span>account</span><br />in a minute.</>}
        lead="Customers, merchants, couriers and dispatchers — pick your role and you're on the network."
      />
      <main className="auth-main">
      <div className="auth-box" style={{ maxWidth: 460 }}>
        <AuthMobileLogo />
        <p className="eyebrow" style={{ marginBottom: 14, color: 'var(--signal)' }}>Get started</p>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join SwiftDrop — fast, reliable delivery</p>

        {/* Role Selector */}
        <div style={{ marginBottom: 22 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>I am a…</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ROLES.map((r, i) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`role-pick ${form.role === r.value ? 'selected' : ''}`}
              >
                {r.icon}
                <span>{r.label}</span>
                <small>0{i + 1}</small>
              </button>
            ))}
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="form-input-icon">
              <User className="icon" size={16} />
              <input id="reg-name" name="name" type="text" className="form-input"
                placeholder="Amal Perera" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div className="form-input-icon">
                <Mail className="icon" size={16} />
                <input id="reg-email" name="email" type="email" className="form-input"
                  placeholder="you@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone</label>
              <div className="form-input-icon">
                <Phone className="icon" size={16} />
                <input id="reg-phone" name="phone" type="tel" className="form-input"
                  placeholder="077-XXXXXXX" value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="form-input-icon" style={{ position: 'relative' }}>
              <Lock className="icon" size={16} />
              <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                className="form-input" placeholder="Min 6 characters" value={form.password}
                onChange={handleChange} required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
      </main>
    </div>
  );
};

export default RegisterPage;
