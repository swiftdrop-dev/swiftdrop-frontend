import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Zap, MapPin, Shield, Clock, BarChart2,
  Star, ArrowRight, CheckCircle, Truck, Store, Users, Activity,
  ShoppingBag, Bike, SlidersHorizontal, Sparkles, Phone,
} from 'lucide-react';

const ROLES = [
  { icon: <ShoppingBag size={24} />, role: 'Customer', path: '/login',
    desc: 'Book parcels, track in real-time, and receive proof of delivery.',
    c: '#0d9488', g: 'linear-gradient(135deg,#2dd4bf,#0d9488)' },
  { icon: <Store size={24} />, role: 'Merchant', path: '/login',
    desc: 'Bulk shipping, business analytics, and priority support for your orders.',
    c: '#0284c7', g: 'linear-gradient(135deg,#38bdf8,#0284c7)' },
  { icon: <Bike size={24} />, role: 'Courier', path: '/login',
    desc: 'View your delivery queue, update statuses, and upload proof of delivery.',
    c: '#ea580c', g: 'linear-gradient(135deg,#fb923c,#ea580c)' },
  { icon: <SlidersHorizontal size={24} />, role: 'Dispatcher', path: '/login',
    desc: 'Assign routes, manage the fleet, and generate business reports.',
    c: '#7c3aed', g: 'linear-gradient(135deg,#a78bfa,#7c3aed)' },
];

const FEATURES = [
  { icon: <MapPin size={22} />, title: 'Real-Time Tracking', cls: 'wide',
    desc: 'Know exactly where your parcel is at every step of the journey with live status updates.' },
  { icon: <Zap size={22} />, title: 'Instant Fee Estimates', cls: '',
    desc: 'Get accurate delivery cost estimates based on weight, size, distance, and package type.' },
  { icon: <Shield size={22} />, title: 'Proof of Delivery', cls: '',
    desc: 'Couriers upload photos and capture digital signatures to confirm successful deliveries.' },
  { icon: <Activity size={22} />, title: 'Live Dashboard', cls: 'dark',
    desc: 'Role-based dashboards give every user exactly the data they need, no more, no less.' },
  { icon: <BarChart2 size={22} />, title: 'Business Reports', cls: '',
    desc: 'Dispatchers access detailed delivery reports, revenue analytics, and courier performance.' },
  { icon: <Truck size={22} />, title: 'Smart Assignment', cls: 'wide',
    desc: 'Dispatchers assign or auto-assign parcels to the nearest available courier instantly.' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <div className="brand-mark"><Package size={19} strokeWidth={2.25} /></div>
          <span className="brand-word">Swift<span>Drop</span></span>
        </Link>

        <div className="landing-nav-menu">
          <a href="#roles">Solutions</a>
          <a href="#features">Features</a>
          <Link to="/track">Tracking</Link>
        </div>

        <div className="landing-nav-links">
          <Link to="/track" className="btn btn-ghost btn-sm hide-sm"><MapPin size={14} /> Track Parcel</Link>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="blobs">
          <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
          <div className="dot-grid" />
        </div>

        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow animate-fade-in">
              <span className="pill"><Sparkles size={12} /> New</span>
              Sri Lanka's fastest courier platform
            </div>

            <h1 className="hero-title animate-fade-in delay-1">
              Deliver anything,{' '}
              <span className="gradient-text">anywhere</span>{' '}
              in Sri Lanka
            </h1>

            <p className="hero-subtitle animate-fade-in delay-2">
              SwiftDrop connects customers, merchants, couriers, and dispatchers
              on one powerful platform. Real-time tracking, instant booking, and
              proof of delivery — all in one place.
            </p>

            <div className="hero-actions animate-fade-in delay-3">
              <Link to="/register" className="btn btn-primary btn-xl">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/track" className="btn btn-secondary btn-xl">
                <MapPin size={18} /> Track a Parcel
              </Link>
            </div>

            <div className="hero-trust animate-fade-in delay-4">
              <div className="avatars">
                <span style={{ background: 'linear-gradient(135deg,#2dd4bf,#0d9488)' }}>AP</span>
                <span style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)' }}>NF</span>
                <span style={{ background: 'linear-gradient(135deg,#fb923c,#ea580c)' }}>KS</span>
                <span style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}>+</span>
              </div>
              <div>
                <div className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <p><b>4.9 Rating</b> · 50,000+ deliveries</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hero-visual animate-fade-in delay-2">
            <div className="float-chip c1">
              <span className="ico" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}><CheckCircle size={18} /></span>
              <div><b>Delivered</b><span className="muted">Galle · 2 min ago</span></div>
            </div>

            <div className="track-card">
              <div className="track-head">
                <div>
                  <p className="eyebrow">Tracking number</p>
                  <p className="track-id">SWF-2024-001234</p>
                </div>
                <span className="badge badge-transit">● In Transit</span>
              </div>

              <div className="track-map">
                <svg viewBox="0 0 400 150" preserveAspectRatio="none">
                  <path d="M40 115 C 120 120, 140 40, 210 70 S 320 30, 360 35"
                    fill="none" stroke="url(#rg)" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
                  <defs>
                    <linearGradient id="rg" x1="0" x2="1">
                      <stop offset="0" stopColor="#14b8a6" /><stop offset="1" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="pin" style={{ left: '8%', top: '72%', background: '#14b8a6' }} />
                <span className="pin" style={{ left: '50%', top: '42%', background: '#f97316' }} />
                <span className="pin" style={{ left: '88%', top: '19%', background: '#0ea5e9' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                <span>Colombo</span><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ETA 4:30 PM</span><span>Kandy</span>
              </div>
              <div className="track-progress"><div /></div>
              <div className="track-steps">
                <span className="on">Booked</span><span className="on">Picked up</span><span className="on">In transit</span><span>Delivered</span>
              </div>

              <div className="track-courier">
                <span className="avatar-ink" style={{ width: 38, height: 38 }}>KS</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>Kasun Silva</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your courier · Bike</p>
                </div>
                <span className="header-icon-btn" style={{ width: 36, height: 36, color: 'var(--primary)' }}><Phone size={16} /></span>
              </div>
            </div>

            <div className="float-chip c2">
              <span className="ico" style={{ background: 'var(--grad-warm)' }}><Zap size={18} /></span>
              <div><b>Same-day</b><span className="muted">Delivery available</span></div>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: 56 }}>
          <div className="trust-strip animate-fade-in delay-4">
            {[
              { icon: <CheckCircle size={16} />, text: '50,000+ Deliveries' },
              { icon: <Star size={16} />, text: '4.9★ Rating' },
              { icon: <Clock size={16} />, text: 'Same-Day Delivery' },
              { icon: <Shield size={16} />, text: 'Fully Insured' },
            ].map((b, i) => <div key={i}>{b.icon}{b.text}</div>)}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="section" id="roles">
        <div className="container">
          <div className="section-head">
            <span className="section-label"><Users size={14} /> For Everyone</span>
            <h2 className="section-title">One platform, <span className="gradient-text">four roles</span></h2>
            <p className="section-subtitle">
              Whether you're sending a parcel or managing a fleet, SwiftDrop has you covered.
            </p>
          </div>

          <div className="role-cards">
            {ROLES.map(r => (
              <Link key={r.role} to={r.path} className="role-card"
                style={{ '--c': r.c, '--g': r.g } as React.CSSProperties}>
                <span className="role-icon">{r.icon}</span>
                <p className="role-name">{r.role}</p>
                <p className="role-desc">{r.desc}</p>
                <span className="role-go">Get started <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="section-label"><Sparkles size={14} /> Why SwiftDrop</span>
            <h2 className="section-title">Built for the modern delivery era</h2>
            <p className="section-subtitle">
              Packed with features that make every delivery smoother, faster, and more transparent.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card ${f.cls}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                {f.cls === 'wide' && i === 0 && (
                  <div className="mini-bars">
                    {[40, 65, 50, 80, 60, 95, 75, 88, 70, 100].map((h, j) => <span key={j} style={{ height: `${h}%` }} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-band-inner">
            <div className="stats-band-grid">
              {[
                { value: '50,000+', label: 'Deliveries Made', icon: <Package size={16} /> },
                { value: '1,200+', label: 'Merchants', icon: <Store size={16} /> },
                { value: '350+', label: 'Active Couriers', icon: <Users size={16} /> },
                { value: '94.2%', label: 'Success Rate', icon: <CheckCircle size={16} /> },
              ].map((s, i) => (
                <div key={i}>
                  <p className="stats-band-v">{s.value}</p>
                  <p className="stats-band-l">{s.icon}{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-block">
            <h2>Ready to ship smarter?</h2>
            <p>Join thousands of customers and merchants who trust SwiftDrop for every delivery.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-xl">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/track" className="btn btn-secondary btn-xl">
                <MapPin size={18} /> Track Parcel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-inner">
            <Link to="/" className="brand">
              <div className="brand-mark" style={{ width: 30, height: 30, borderRadius: 9 }}><Package size={15} /></div>
              <span className="brand-word" style={{ fontSize: 16 }}>Swift<span>Drop</span></span>
            </Link>
            <p>© 2024 SwiftDrop. All rights reserved. Sri Lanka's Premier Courier Platform.</p>
            <div style={{ display: 'flex', gap: 20, fontWeight: 600 }}>
              <Link to="/track">Track</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
