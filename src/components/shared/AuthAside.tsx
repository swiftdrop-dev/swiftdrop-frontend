import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

// Brand panel shown on the left side of auth pages (hidden on narrow screens).
export const AuthAside: React.FC<{ headline: React.ReactNode; lead: string }> = ({ headline, lead }) => (
  <aside className="auth-aside">
    <Link to="/" className="brand">
      <div className="brand-mark"><Package size={17} strokeWidth={2.25} /></div>
      <div>
        <span className="brand-word">Swift<span>Drop</span></span>
        <span className="brand-sub">Courier OS · Sri Lanka</span>
      </div>
    </Link>

    <div>
      <h2>{headline}</h2>
      <p className="lead">{lead}</p>
    </div>

    <div className="auth-manifest">
      <div><span>Network</span><b>25 districts</b></div>
      <div><span>Active couriers</span><b>350+</b></div>
      <div><span>On-time rate</span><b>94.2%</b></div>
      <div><span>System status</span><b className="sig">● Operational</b></div>
    </div>
  </aside>
);

// Compact logo shown above the form on narrow screens.
export const AuthMobileLogo: React.FC = () => (
  <div className="auth-logo">
    <Link to="/" className="brand">
      <div className="brand-mark"><Package size={17} strokeWidth={2.25} /></div>
      <span className="brand-word">Swift<span>Drop</span></span>
    </Link>
  </div>
);
