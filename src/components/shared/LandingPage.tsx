import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroCourierImg from '../../assets/hero-courier.jpg';
import swiftDropTeamImg from '../../assets/swiftdrop-team.png';
import swiftDropMark from '../../assets/swiftdrop-mark.svg';
import proofOfDeliveryImg from '../../assets/proof-of-delivery.svg';
import './LandingPage.css';
import {
  Package, Zap, MapPin, Shield,
  ArrowRight, CheckCircle, Truck, Store, Users,
  Home, Menu, X, Info, Mail, ClipboardList, Banknote, Phone,
} from 'lucide-react';

const SERVICES = [
  {
    icon: <Package size={22} />,
    role: 'Door-to-Door Delivery',
    path: '/register',
    tag: 'Convenient Shipping',
    image: heroCourierImg,
    desc: 'Book a parcel online with pickup and delivery details, and let our couriers handle the journey.',
    c: '#0d9488',
    g: 'linear-gradient(135deg,#2dd4bf,#0d9488)',
  },
  {
    icon: <MapPin size={22} />,
    role: 'Real-Time Tracking',
    path: '/track',
    tag: 'Stay Updated',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Follow your parcel with its tracking number and see delivery status updates in one place.',
    c: '#0284c7',
    g: 'linear-gradient(135deg,#38bdf8,#0284c7)',
  },
  {
    icon: <Banknote size={22} />,
    role: 'Cash on Delivery',
    path: '/register',
    tag: 'Flexible Payments',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
    desc: 'Choose cash on delivery when booking and manage your parcel payment details online.',
    c: '#ea580c',
    g: 'linear-gradient(135deg,#fb923c,#ea580c)',
  },
  {
    icon: <Store size={22} />,
    role: 'Bulk Business Shipping',
    path: '/register',
    tag: 'For Merchants',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    desc: 'Create multiple shipments with bulk booking and keep your business deliveries organised.',
    c: '#7c3aed',
    g: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
  },
  {
    icon: <Zap size={22} />, role: 'Instant Fee Estimates', path: '/register', tag: 'Plan Your Delivery',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    desc: 'Check an estimated shipping fee using your parcel details before confirming a booking.',
    c: '#0284c7', g: 'linear-gradient(135deg,#38bdf8,#0284c7)',
  },
  {
    icon: <Shield size={22} />, role: 'Proof of Delivery', path: '/track', tag: 'Delivery Confidence',
    image: proofOfDeliveryImg,
    desc: 'Delivery photos, signatures and OTP verification help confirm your parcel reached its recipient.',
    c: '#0d9488', g: 'linear-gradient(135deg,#2dd4bf,#0d9488)',
  },
];

const DELIVERY_STEPS = [
  { icon: <ClipboardList size={30} />, title: 'Book Your Parcel', desc: 'Create an account, enter pickup and recipient details, and check your delivery fee.' },
  { icon: <Package size={30} />, title: 'We Collect', desc: 'A courier is assigned to your parcel and collects it from the pickup location.' },
  { icon: <Truck size={30} />, title: 'Track the Journey', desc: 'Use your tracking number to follow status updates as your parcel moves towards its destination.' },
  { icon: <CheckCircle size={30} />, title: 'Delivery Confirmed', desc: 'Your courier completes the delivery with proof such as a photo, signature or OTP verification.' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickTrack, setQuickTrack] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  const processRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = processRef.current;
    if (!section || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    section.classList.add('process-motion-ready');
    observer.observe(section);
    return () => {
      observer.disconnect();
      section.classList.remove('process-motion-ready', 'is-visible');
    };
  }, []);

  useEffect(() => {
    const updateNavbar = () => {
      setNavCompact((compact) => window.scrollY > (compact ? 24 : 80));
    };
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });
    return () => window.removeEventListener('scroll', updateNavbar);
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrack.trim()) {
      navigate(`/track?q=${encodeURIComponent(quickTrack.trim())}`);
    }
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <div className={`landing-nav-shell${navCompact ? ' is-compact' : ''}`}>
      <nav className="landing-nav landing-nav-dark" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="SwiftDrop home">
          <img className="landing-brand-mark" src={swiftDropMark} alt="" width="46" height="46" />
          <span className="brand-word">Swift<span>Drop</span></span>
        </Link>

        <div id="landing-navigation" className={`landing-nav-menu${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}>
          <Link to="/" className="nav-link-icon is-active" aria-current="page"><span>Home</span><Home className="landing-link-icon" size={16} aria-hidden="true" /></Link>
          <a href="#services"><span>Services</span><Truck className="landing-link-icon" size={16} aria-hidden="true" /></a>
          <Link to="/track"><span>Track Parcel</span><MapPin className="landing-link-icon" size={16} aria-hidden="true" /></Link>
          <Link to="/about"><span>About</span><Info className="landing-link-icon" size={16} aria-hidden="true" /></Link>
          <Link to="/contact"><span>Contact</span><Mail className="landing-link-icon" size={16} aria-hidden="true" /></Link>
        </div>

        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-nav-login btn-sm">Login</Link>
          <Link to="/register" className="btn btn-nav-signup btn-sm">Sign Up</Link>
          <button type="button" className="landing-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      </div>

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
                <span className="hero-dark-accent">Courier</span>{' '}Service
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

          <Link to="/track" className="hero-track-order">
            <Truck size={20} aria-hidden="true" />
            <span>Track Your Order</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

        </div>
      </section>

      {/* Delivery services */}
      <section className="section landing-services" id="services" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head">

            <span className="landing-section-eyebrow">OUR SERVICES</span>
            <h2 className="section-title" id="services-title">Delivery services, <span className="gradient-text">built around you</span></h2>
            <p className="section-subtitle">
              From a single parcel to your next batch of orders, find a simpler way to ship with SwiftDrop.
            </p>
          </div>

          <div className="service-cards">
            {SERVICES.map(r => (
              <article
                key={r.role}
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={processRef} className="section landing-process" aria-labelledby="process-title">
        <div className="container">
          <div className="delivery-process-panel">
            <div className="section-head">
              <span className="landing-section-eyebrow">SIMPLE PROCESS</span>
              <h2 className="section-title" id="process-title">How it <span className="gradient-text">works</span></h2>
              <p className="section-subtitle">Four simple steps from booking to a confirmed delivery.</p>
            </div>
            <ol className="delivery-steps">
              {DELIVERY_STEPS.map((step, index) => (
                <li className="delivery-step" key={step.title}>
                  <div className="delivery-step-icon" aria-hidden="true">{step.icon}</div>
                  <span className="delivery-step-number">STEP {String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Web portal */}
      <section className="section landing-portal" id="features" aria-labelledby="portal-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">

            <span className="landing-section-eyebrow">YOUR DELIVERY WORKSPACE</span>
            <h2 className="section-title" id="portal-title">SwiftDrop <span className="gradient-text">Web Portal</span></h2>
            <p className="section-subtitle">
              Everything you need to manage your deliveries, together in one place.
            </p>
          </div>

          <div className="portal-grid">
            <article className="portal-card portal-intro">
              <span className="portal-icon"><Package size={24} /></span>
              <h3>Every delivery.<br />One simple dashboard.</h3>
              <p>Book parcels, follow their journey and keep your delivery details organised, wherever you are.</p>
            </article>
            <article className="portal-card portal-access">
              <div className="portal-access-title"><Shield size={22} /><h3>Your next delivery starts here</h3></div>
              <p>Sign in to your SwiftDrop account to book and manage your parcels.</p>
              <Link to="/login" className="portal-signin">Sign in <ArrowRight size={18} /></Link>
            </article>
            <div className="portal-team-frame">
              <div className="portal-frame-bar"><span /><span /><span /><p>The people behind your deliveries</p></div>
              <img className="portal-team-photo" src={swiftDropTeamImg} alt="SwiftDrop team wearing navy and orange branded shirts in the office" width="1536" height="1024" loading="lazy" />
            </div>
            <article className="portal-card portal-detail">
              <div className="portal-tracking" aria-label="Illustration of delivery progress">
                <span className="is-complete"><i /><b>Picked up</b></span>
                <span className="is-complete"><i /><b>In transit</b></span>
                <span><i /><b>Delivered</b></span>
              </div>
              <h3>Follow every parcel</h3>
              <p>Stay up to date from pickup to your recipient’s doorstep.</p>
            </article>
            <article className="portal-card portal-detail">
              <div className="portal-preview"><span className="portal-icon"><Banknote size={24} /></span><div><small>PAYMENT OPTIONS</small><strong>Cash on delivery</strong></div><span className="portal-chip">COD</span></div>
              <h3>Payments, kept simple</h3>
              <p>Choose cash on delivery and keep payment details with your shipment.</p>
            </article>
            <article className="portal-card portal-detail">
              <div className="portal-preview portal-upload-preview" aria-label="Illustration of a bulk order upload">
                <span className="portal-icon"><ClipboardList size={24} /></span>
                <div className="portal-upload-content"><strong>upload_orders.csv</strong><small>Bulk order upload</small><div className="portal-upload-track" aria-hidden="true"><span /></div></div>
                <span className="portal-chip">CSV</span>
              </div>
              <h3>Made for your business</h3>
              <p>Organise bulk bookings and pickup details as your business grows.</p>
            </article>
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
      <section className="landing-contact-banner" aria-labelledby="delivery-contact-title">
        <div className="container landing-contact-inner">
          <div className="landing-contact-copy">
            <span className="landing-contact-eyebrow">READY TO START YOUR DELIVERY?</span>
            <h2 id="delivery-contact-title">Driven by care. Delivered with SwiftDrop.</h2>
            <p>Connecting people and businesses through simpler, smarter deliveries.</p>
          </div>
          <a className="landing-contact-phone" href="tel:+94112345678"><Phone size={22} aria-hidden="true" /><span>+94 11 234 5678</span></a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-inner">
            <Link to="/" className="brand">
              <img src={swiftDropMark} alt="" width="34" height="34" />
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
