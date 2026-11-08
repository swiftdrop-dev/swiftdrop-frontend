import React from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, Clock, CheckCircle, XCircle, List, MapPin, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, EmptyState } from '../../../components/shared/SharedComponents';
import { useAuth } from '../../auth/context/AuthContext';
import { MOCK_PARCELS } from '../../../lib/mockData';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const myParcels = MOCK_PARCELS.filter(p => p.senderId === 'usr_001');

  const stats = {
    total: myParcels.length,
    delivered: myParcels.filter(p => p.status === 'delivered').length,
    pending: myParcels.filter(p => ['pending', 'assigned', 'picked_up', 'in_transit'].includes(p.status)).length,
    cancelled: myParcels.filter(p => p.status === 'cancelled').length,
  };

  const recent = myParcels.slice(0, 5);

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="banner">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Track, manage, and book your parcels all in one place.
          </p>
        </div>
        <Link to="/customer/book" className="btn btn-primary">
          <PlusCircle size={16} /> Book New Parcel
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={stats.total} label="Total Parcels" change={12} variant="primary" />
        <StatCard icon={<CheckCircle size={20} />} value={stats.delivered} label="Delivered" change={8} variant="success" />
        <StatCard icon={<Clock size={20} />} value={stats.pending} label="In Progress" variant="warning" />
        <StatCard icon={<XCircle size={20} />} value={stats.cancelled} label="Cancelled" variant="danger" />
      </div>

      {/* Recent Parcels */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Shipments</span>
          <Link to="/customer/parcels" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          {recent.length === 0 ? (
            <EmptyState title="No parcels yet" description="Book your first parcel to get started." action={
              <Link to="/customer/book" className="btn btn-primary"><PlusCircle size={16} /> Book Now</Link>
            } />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.trackingNumber}</strong></td>
                    <td>{p.recipientName}</td>
                    <td>{p.recipientAddress.city}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('en-LK')}</td>
                    <td>
                      <Link to={`/track?q=${p.trackingNumber}`} className="btn btn-ghost btn-sm">
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        {[
          { icon: <Package size={18} />, label: 'Book a Parcel', desc: 'Send something new', to: '/customer/book', color: 'var(--primary)' },
          { icon: <List size={18} />, label: 'My Parcels', desc: 'View all shipments', to: '/customer/parcels', color: 'var(--success)' },
          { icon: <MapPin size={18} />, label: 'Track Parcel', desc: 'Real-time location', to: '/track', color: 'var(--warning)' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)',
            transition: 'all var(--transition)', textDecoration: 'none',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            <span style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'var(--grad)', color: '#fff', borderRadius: 12, flexShrink: 0 }}>{a.icon}</span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{a.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</p>
            </div>
            <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
