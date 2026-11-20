import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, MapPin, Phone, Mail, Clock,
  CheckCircle, ArrowRight, Send,
} from 'lucide-react';

const OFFICES = [
  {
    city: 'Colombo HQ',
    address: '45 Galle Road, Colombo 03, Western Province',
    phone: '+94 11 234 5678',
    email: 'colombo@swiftdrop.lk',
    hours: 'Mon–Sat: 8:00 AM – 8:00 PM',
  },
  {
    city: 'Kandy Hub',
    address: '12 Peradeniya Road, Kandy, Central Province',
    phone: '+94 81 234 5678',
    email: 'kandy@swiftdrop.lk',
    hours: 'Mon–Sat: 8:00 AM – 6:00 PM',
  },
  {
    city: 'Galle Hub',
    address: '8 Wakwella Road, Galle, Southern Province',
    phone: '+94 91 234 5678',
    email: 'galle@swiftdrop.lk',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
  },
];

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
          <Link to="/about">About</Link>
          <Link to="/contact" className="active">Contact</Link>
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
        <div className="container" style={{ maxWidth: 700 }}>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            We're here to <span style={{ color: '#f97316' }}>Help You</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
            Have a question, feedback, or need support? Reach out to our team and we'll
            get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* Form */}
            <div className="card" style={{ padding: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Send us a message</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                Fill in the form below and our support team will get back to you shortly.
              </p>

              {submitted ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 16, padding: '48px 24px', textAlign: 'center',
                }}>
                  <CheckCircle size={48} style={{ color: 'var(--success)' }} />
                  <h3 style={{ fontWeight: 700, fontSize: 18 }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Thank you for reaching out. Our team will respond to <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSubmitted(false); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Full Name *</span>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Email Address *</span>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Subject *</span>
                    <select
                      className="form-input"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                    >
                      <option value="">Select a subject...</option>
                      <option>Tracking Issue</option>
                      <option>Booking Support</option>
                      <option>Courier Inquiry</option>
                      <option>Merchant Partnership</option>
                      <option>Billing & Payments</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Message *</span>
                    <textarea
                      className="form-input"
                      rows={5}
                      placeholder="Describe your issue or question in detail..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                    />
                  </label>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Quick contact */}
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Quick Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { icon: <Phone size={18} />, label: 'Hotline', val: '+94 11 234 5678', color: '#0d9488' },
                    { icon: <Mail size={18} />, label: 'Email', val: 'support@swiftdrop.lk', color: '#0ea5e9' },
                    { icon: <Clock size={18} />, label: 'Support Hours', val: 'Mon–Sat, 8:00 AM – 8:00 PM', color: '#f97316' },
                    { icon: <MapPin size={18} />, label: 'Head Office', val: '45 Galle Road, Colombo 03', color: '#7c3aed' },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        display: 'grid', placeItems: 'center',
                        background: `${c.color}18`, color: c.color,
                      }}>
                        {c.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{c.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office locations */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Our Hubs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {OFFICES.map((o, i) => (
                    <div key={i} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <MapPin size={15} style={{ color: 'var(--primary)' }} />
                        <strong style={{ fontSize: 14 }}>{o.city}</strong>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {o.address}<br />
                        <span style={{ color: 'var(--primary-light)' }}>{o.phone}</span> · {o.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-block">
            <h2>Need a quick answer?</h2>
            <p>Track your parcel instantly with your tracking number — no login needed.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/track" className="btn btn-primary btn-xl"><MapPin size={18} /> Track Parcel</Link>
              <Link to="/register" className="btn btn-secondary btn-xl">Create Account <ArrowRight size={18} /></Link>
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

export default ContactPage;

