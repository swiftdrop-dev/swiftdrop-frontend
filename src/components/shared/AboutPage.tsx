import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Users, Truck, Shield, MapPin, Star,
  CheckCircle, Zap, ArrowRight, Heart,
} from 'lucide-react';

const TEAM = [
  { name: 'Kaweesha Perera', role: 'Project Lead & Backend', avatar: 'KP', color: '#0d9488' },
  { name: 'Team Member 2', role: 'Customer Booking & History', avatar: 'M2', color: '#0ea5e9' },
  { name: 'Team Member 3', role: 'Courier Management', avatar: 'M3', color: '#f97316' },
  { name: 'Team Member 4', role: 'Dispatcher & Reports', avatar: 'M4', color: '#7c3aed' },
];

const MILESTONES = [
  { year: '2023', title: 'Founded', desc: 'SwiftDrop was born as a university capstone project to revolutionize last-mile delivery in Sri Lanka.' },
  { year: '2024', title: 'Platform Launch', desc: 'Full platform launched with real-time GPS tracking, multi-role dashboards, and COD support.' },
  { year: '2025', title: 'Island-Wide', desc: 'Expanded to all 25 districts with 350+ verified couriers across Sri Lanka.' },
  { year: '2026', title: '50K Deliveries', desc: 'Surpassed 50,000 deliveries with a 94.2% success rate and 4.9★ customer rating.' },
];

const VALUES = [
  { icon: <Zap size={22} />, title: 'Speed', desc: 'Same-day delivery available in Colombo, Gampaha & Kalutara districts.', color: '#f97316' },
  { icon: <Shield size={22} />, title: 'Trust', desc: 'Every parcel is 100% insured with digital proof of delivery — photo + OTP.', color: '#0d9488' },
  { icon: <MapPin size={22} />, title: 'Transparency', desc: 'Real-time GPS tracking so you know exactly where your parcel is at all times.', color: '#0ea5e9' },
  { icon: <Heart size={22} />, title: 'Community', desc: 'Supporting local couriers and merchants across all 25 districts of Sri Lanka.', color: '#7c3aed' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav landing-nav-dark">
        <Link to="/" className="brand">
          <div className="brand-mark"><Package size={19} strokeWidth={2.25} /></div>
          <span className="brand-word">Swift<span>Drop</span></span>
        </Link>
        <div className="landing-nav-menu">
          <Link to="/">Home</Link>
          <a href="/#roles">Services</a>
          <Link to="/track">Track Parcel</Link>
          <Link to="/about" className="active">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-sm" style={{ background: '#f97316', color: '#fff', border: 'none' }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(130deg, #0c1a2e 0%, #0d2744 60%, #0a1f38 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 760 }}>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Connecting Sri Lanka,{' '}
            <span style={{ color: '#f97316' }}>One Delivery at a Time</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 36px' }}>
            SwiftDrop is Sri Lanka's fastest growing courier platform, built to connect
            customers, merchants, couriers and dispatchers on one seamless, transparent platform.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">Get Started <ArrowRight size={18} /></Link>
            <Link to="/contact" className="btn btn-xl" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-band-inner">
            <div className="stats-band-grid">
              {[
                { value: '50,000+', label: 'Deliveries Made', icon: <Package size={16} /> },
                { value: '350+', label: 'Active Couriers', icon: <Truck size={16} /> },
                { value: '25', label: 'Districts Covered', icon: <MapPin size={16} /> },
                { value: '4.9★', label: 'Customer Rating', icon: <Star size={16} /> },
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

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 className="section-title">Our <span className="gradient-text">Mission</span></h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
                To make parcel delivery in Sri Lanka fast, affordable, and transparent for every business
                and individual — from downtown Colombo to the furthest corners of the island.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Real-time GPS tracking for every parcel',
                  'Digital proof of delivery — photo + OTP verification',
                  'Same-day express delivery in Western Province',
                  'Transparent pricing with no hidden fees',
                  'Cash on delivery (COD) support nationwide',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {VALUES.map((v, i) => (
                <div key={i} className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
                    display: 'grid', placeItems: 'center',
                    background: `${v.color}18`, color: v.color,
                  }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{v.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--bg-secondary)', paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our <span className="gradient-text">Journey</span></h2>
            <p className="section-subtitle">From a university project to Sri Lanka's premier courier platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginTop: 40 }}>
            {MILESTONES.map((m, i) => (
              <div key={i} className="card" style={{ padding: 28, borderTop: '3px solid var(--primary)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em' }}>{m.year}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '8px 0 10px' }}>{m.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Meet the <span className="gradient-text">Team</span></h2>
            <p className="section-subtitle">The student developers behind SwiftDrop.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 40 }}>
            {TEAM.map((t, i) => (
              <div key={i} className="card" style={{ padding: 28, textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}cc, ${t.color})`,
                  color: '#fff', fontWeight: 800, fontSize: 20,
                  display: 'grid', placeItems: 'center',
                  margin: '0 auto 16px',
                }}>
                  {t.avatar}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.role}</p>
              </div>
            ))}
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
              <Link to="/register" className="btn btn-primary btn-xl">Create Free Account <ArrowRight size={18} /></Link>
              <Link to="/track" className="btn btn-secondary btn-xl"><MapPin size={18} /> Track Parcel</Link>
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
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/track">Track</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

