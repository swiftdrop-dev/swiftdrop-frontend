import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { MOCK_PARCELS } from '../../../lib/mockData';
import { StatusBadge, StatusTimeline } from '../../../components/shared/SharedComponents';

const PublicTracking: React.FC = () => {
  const [trackingNum, setTrackingNum] = useState('');
  const [result, setResult] = useState<typeof MOCK_PARCELS[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);

    await new Promise(r => setTimeout(r, 700));

    const found = MOCK_PARCELS.find(p =>
      p.trackingNumber.toLowerCase() === trackingNum.trim().toLowerCase()
    );

    setLoading(false);
    if (found) setResult(found);
    else setNotFound(true);
  };

  return (
    <div className="tracking-hero">
      <div className="blobs">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
        <div className="dot-grid" />
      </div>
      {/* Navbar */}
      <div className="tracking-nav">
        <Link to="/" className="brand">
          <div className="brand-mark"><Package size={17} strokeWidth={2.25} /></div>
          <div>
            <span className="brand-word">Swift<span>Drop</span></span>
            <span className="brand-sub">Public tracking</span>
          </div>
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Search Box */}
      <div className="tracking-box animate-scale-in">
        <div style={{ marginBottom: 26 }}>
          <p className="section-label" style={{ marginBottom: 16 }}>
            <MapPin size={13} /> Live tracking
          </p>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 42px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.1, letterSpacing: '-0.04em' }}>
            Track your <span className="gradient-text">parcel</span>
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
            Enter your tracking number to see real-time delivery status
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 40, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', height: 50 }}
              placeholder="e.g. SWF-2024-001234"
              value={trackingNum}
              onChange={e => setTrackingNum(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 104 }}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Track'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-overlay)', borderRadius: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Try demo:</strong>{' '}
          {MOCK_PARCELS.slice(0, 3).map((p, i) => (
            <span key={p.id}>
              <button
                type="button"
                onClick={() => setTrackingNum(p.trackingNumber)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: 0 , fontWeight: 600 }}
              >
                {p.trackingNumber}
              </button>
              {i < 2 && ' · '}
            </span>
          ))}
        </div>

        {notFound && (
          <div style={{
            marginTop: 16, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
            borderRadius: 10, padding: '12px 16px', textAlign: 'center', color: 'var(--danger)', fontSize: 14,
          }}>
            No parcel found with this tracking number. Please double-check and try again.
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="tracking-result">
          <div className="card">
            <div className="card-header">
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {result.trackingNumber}
                </p>
                <StatusBadge status={result.status} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                <p>Booked {new Date(result.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</p>
                {result.estimatedDeliveryDate && (
                  <p>Est. {new Date(result.estimatedDeliveryDate).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</p>
                )}
              </div>
            </div>

            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Left: Route info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Parcel Details</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Package size={14} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{result.description}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <MapPin size={14} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>From</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{result.pickupAddress.city}, {result.pickupAddress.district}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <MapPin size={14} style={{ color: 'var(--primary-light)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>To</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{result.recipientAddress.street}, {result.recipientAddress.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.courierName && (
                  <div style={{ background: 'var(--bg-overlay)', borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Courier</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {result.courierName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{result.courierName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} /> {result.courierPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ background: 'var(--bg-overlay)', borderRadius: 14, padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Recipient</p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <User size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{result.recipientName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Phone size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.recipientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Right: Timeline */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 16 }}>Delivery Progress</p>
                <StatusTimeline history={result.statusHistory} currentStatus={result.status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTracking;
