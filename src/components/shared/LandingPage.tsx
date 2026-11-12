import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroCourierImg from '../../assets/hero-courier.jpg';
import swiftDropMark from '../../assets/swiftdrop-mark.svg';
import proofOfDeliveryImg from '../../assets/proof-of-delivery.svg';
import './LandingPage.css';
import {
  Package, Zap, MapPin, Shield, BarChart2,
  ArrowRight, CheckCircle, Truck, Store, Users, Activity,
  Home, Menu, X, Info, Mail, ClipboardList, Banknote,
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
                    {r.path === '/track' ? 'Track a parcel' : 'Get started'} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
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
