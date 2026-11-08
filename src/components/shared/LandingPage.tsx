import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroCourierImg from '../../assets/hero-courier.jpg';
import {
  Package, Zap, MapPin, Shield, BarChart2,
  ArrowRight, CheckCircle, Truck, Store, Users, Activity,
  ShoppingBag, Bike, SlidersHorizontal, Sparkles, Home,
} from 'lucide-react';

const ROLES = [
  {
    icon: <ShoppingBag size={22} />,
    role: 'Customer',
    path: '/login',
    tag: 'Personal & Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    desc: 'Book parcels in seconds, track in real-time, and get digital proof of delivery.',
    c: '#0d9488',
    g: 'linear-gradient(135deg,#2dd4bf,#0d9488)',
  },
  {
    icon: <Store size={22} />,
    role: 'Merchant',
    path: '/login',
    tag: 'E-commerce & Retail',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80',
    desc: 'Bulk shipping, merchant APIs, webhooks, and cash-on-delivery management.',
    c: '#0284c7',
    g: 'linear-gradient(135deg,#38bdf8,#0284c7)',
  },
  {
    icon: <Bike size={22} />,
    role: 'Courier',
    path: '/login',
    tag: 'Riders & Drivers',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
    desc: 'View your delivery queue, update statuses, upload photo proof, and enter OTP.',
    c: '#ea580c',
    g: 'linear-gradient(135deg,#fb923c,#ea580c)',
  },
  {
    icon: <SlidersHorizontal size={22} />,
    role: 'Dispatcher',
    path: '/login',
    tag: 'Hub Operations',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    desc: 'Assign routes, balance courier workloads, and generate analytical business reports.',
    c: '#7c3aed',
    g: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
  },
];

const FEATURES = [
  {
    icon: <MapPin size={22} />, title: 'Real-Time Tracking', cls: 'wide',
    desc: 'Know exactly where your parcel is at every step of the journey with live status updates.'
  },
  {
    icon: <Zap size={22} />, title: 'Instant Fee Estimates', cls: '',
    desc: 'Get accurate delivery cost estimates based on weight, size, distance, and package type.'
  },
  {
    icon: <Shield size={22} />, title: 'Proof of Delivery', cls: '',
    desc: 'Couriers upload photos and capture digital signatures to confirm successful deliveries.'
  },
  {
    icon: <Activity size={22} />, title: 'Live Dashboard', cls: 'dark',
    desc: 'Role-based dashboards give every user exactly the data they need, no more, no less.'
  },
  {
    icon: <BarChart2 size={22} />, title: 'Business Reports', cls: '',
    desc: 'Dispatchers access detailed delivery reports, revenue analytics, and courier performance.'
  },
  {
    icon: <Truck size={22} />, title: 'Smart Assignment', cls: 'wide',
    desc: 'Dispatchers assign or auto-assign parcels to the nearest available courier instantly.'
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickTrack, setQuickTrack] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrack.trim()) {
      navigate(`/track?q=${encodeURIComponent(quickTrack.trim())}`);
    }
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav landing-nav-dark">
        <Link to="/" className="brand">
          <div className="brand-mark"><Package size={19} strokeWidth={2.25} /></div>
          <span className="brand-word">Swift<span>Drop</span></span>
        </Link>

        <div className="landing-nav-menu">
          <Link to="/" className="nav-link-icon"><Home size={14} /> Home</Link>
          <a href="#roles">Services</a>
          <Link to="/track">Track Parcel</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-nav-login btn-sm">Login</Link>
          <Link to="/register" className="btn btn-nav-signup btn-sm">Sign Up</Link>
        </div>
      </nav>

      {/* ── DARK SPLIT HERO ── */}
      <section className="hero-section hero-dark">

        <div className="hero-dark-container">

          {/* LEFT — text + tracking bar */}
          <div className="hero-dark-left">

            <div className="hero-dark-eyebrow animate-fade-in">

              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, fontWeight: 500 }}>
                Sri Lanka's fastest courier platform
              </span>
            </div>

            <h1 className="hero-dark-title animate-fade-in delay-1">
              Fast, Reliable &amp;{' '}
              <span style={{ display: 'block' }}>
                <span className="hero-dark-accent">Courier</span>{' '}Services
              </span>
            </h1>

            <p className="hero-dark-sub animate-fade-in delay-2">
              Ship anywhere in Sri Lanka and beyond.<br />
              Real-time tracking, instant booking, proof of delivery.
            </p>

            {/* Track bar */}
            <div className="hero-dark-track-wrap animate-fade-in delay-3">
              <div className="hero-dark-track-label">
                <MapPin size={14} /> Track Your Shipment
              </div>
              <form onSubmit={handleQuickTrack} className="hero-dark-track-bar">
                <Package size={18} className="hero-dark-track-icon" />
                <input
                  type="text"
                  placeholder="Enter Tracking Number (e.g. SWF-2024-001234)"
                  value={quickTrack}
                  onChange={(e) => setQuickTrack(e.target.value)}
                  className="hero-dark-track-input"
                  aria-label="Tracking number"
                />
                <button type="submit" className="btn hero-dark-track-btn">
                  Track Parcel <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Trust badges */}
            <div className="hero-dark-badges animate-fade-in delay-4">
              <div><Zap size={16} /><span>Express Delivery</span></div>
              <div><Shield size={16} /><span>Secure &amp; Trusted</span></div>
              <div><MapPin size={16} /><span>Nationwide Coverage</span></div>
            </div>

          </div>

          {/* RIGHT — courier image */}
          <div className="hero-dark-right animate-fade-in delay-2">
            <img
              src={heroCourierImg}
              alt="SwiftDrop courier delivering parcel"
              className="hero-dark-img"
            />
          </div>

        </div>
      </section>

      {/* Roles */}
      <section className="section" id="roles">
        <div className="container">
          <div className="section-head">

            <h2 className="section-title">One platform, <span className="gradient-text">four roles</span></h2>
            <p className="section-subtitle">
              Whether you're sending a parcel or managing a fleet, SwiftDrop has you covered.
            </p>
          </div>

          <div className="role-cards">
            {ROLES.map(r => (
              <Link
                key={r.role}
                to={r.path}
                className="role-card role-card-photo"
                style={{ '--c': r.c, '--g': r.g } as React.CSSProperties}
              >
                <div className="role-card-thumb">
                  <img src={r.image} alt={r.role} className="role-thumb-img" loading="lazy" />
                  <span className="role-tag-badge">{r.tag}</span>
                  <span className="role-icon-float">{r.icon}</span>
                </div>
                <div className="role-card-body">
                  <p className="role-name">{r.role}</p>
                  <p className="role-desc">{r.desc}</p>
                  <span className="role-go">
                    Explore {r.role} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">

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

      {/* Fleet Showcase */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container">
          <div className="fleet-banner-card animate-fade-in">
            <div
              className="fleet-banner-bg"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="fleet-banner-content">
              <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                <Truck size={13} /> Nationwide Logistics
              </span>
              <h2>Connecting Every Corner of Sri Lanka</h2>
              <p>
                From downtown Colombo to Jaffna, Kandy, Galle, and Batticaloa — our verified multi-vehicle
                fleet delivers your parcels safely, on time, with full tracking and proof of delivery.
              </p>
              <div className="fleet-banner-badges">
                <div>
                  <b>25</b>
                  <span>Districts Covered</span>
                </div>
                <div>
                  <b>350+</b>
                  <span>Active Couriers</span>
                </div>
                <div>
                  <b>99.4%</b>
                  <span>On-Time Dispatch</span>
                </div>
                <div>
                  <b>100%</b>
                  <span>Insured Deliveries</span>
                </div>
              </div>
            </div>
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
