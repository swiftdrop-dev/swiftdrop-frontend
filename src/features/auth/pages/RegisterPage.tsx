import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import { AuthAside, AuthMobileLogo } from '../../../components/shared/AuthAside';

const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await register(form);
      if (!result.success) setError(result.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthAside
        headline={<>Open your<br /><span>account</span><br />in a minute.</>}
        lead="Create a customer account to book, manage and track your deliveries."
      />
      <main className="auth-main">
      <div className="auth-box" style={{ maxWidth: 460 }}>
        <AuthMobileLogo />
        <p className="eyebrow" style={{ marginBottom: 14, color: 'var(--signal)' }}>Get started</p>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join SwiftDrop — fast, reliable delivery</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="form-input-icon">
              <User className="icon" size={16} />
              <input id="reg-name" name="name" type="text" className="form-input"
                placeholder="Amal Perera" value={form.name} onChange={handleChange} required minLength={2} maxLength={100} autoComplete="name" />
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
                onChange={handleChange} required minLength={6} autoComplete="new-password" style={{ paddingRight: 40 }} />
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
