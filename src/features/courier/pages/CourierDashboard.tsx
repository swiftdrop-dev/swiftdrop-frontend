import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle, Clock, Star, MapPin, Package } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';

const CourierDashboard: React.FC = () => {
  const myDeliveries = MOCK_PARCELS.filter(p => p.courierId === 'cou_001');
  const today = myDeliveries.filter(p =>
    new Date(p.createdAt).toDateString() === new Date().toDateString() ||
    ['picked_up', 'in_transit', 'assigned'].includes(p.status)
  );

  const stats = {
    today: today.length,
    delivered: myDeliveries.filter(p => p.status === 'delivered').length,
    pending: myDeliveries.filter(p => ['assigned', 'picked_up', 'in_transit'].includes(p.status)).length,
    earnings: myDeliveries.filter(p => p.status === 'delivered').length * 250,
  };

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="banner-icon">
            <Truck size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              You're on duty!
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={13} fill="var(--warning)" color="var(--warning)" /> 4.8 Rating
              </span>
              <span>·</span>
              <span>342 Total Deliveries</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Active
              </span>
            </div>
          </div>
        </div>
        <Link to="/courier/deliveries" className="btn btn-warning">
          <Truck size={16} /> View Deliveries
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={stats.today} label="Today's Queue" variant="warning" />
        <StatCard icon={<CheckCircle size={20} />} value={stats.delivered} label="Delivered (all time)" change={5} variant="success" />
        <StatCard icon={<Clock size={20} />} value={stats.pending} label="In Progress" variant="primary" />
        <StatCard icon={<Star size={20} />} value={`Rs. ${stats.earnings.toLocaleString()}`} label="Est. Earnings" change={12} variant="info" />
      </div>

      {/* Active Deliveries */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Active Deliveries</span>
          <Link to="/courier/deliveries" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Recipient</th>
                <th>Drop Address</th>
                <th>Package</th>
                <th>Status</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {myDeliveries.filter(p => ['assigned', 'picked_up', 'in_transit'].includes(p.status)).map((p, i) => (
                <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.recipientName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <MapPin size={13} color="var(--primary-light)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{p.recipientAddress.street}, {p.recipientAddress.city}</span>
                    </div>
                  </td>
                  <td>{p.description} · {p.weight}kg</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>Rs. {p.deliveryFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Today */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Completed Today</span>
          <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
            {myDeliveries.filter(p => p.status === 'delivered').length} deliveries ✓
          </span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Tracking #</th><th>Recipient</th><th>Status</th><th>Delivered At</th></tr>
            </thead>
            <tbody>
              {myDeliveries.filter(p => p.status === 'delivered').map(p => (
                <tr key={p.id}>
                  <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--success)' }}>{p.trackingNumber}</strong></td>
                  <td>{p.recipientName}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.deliveredAt ? new Date(p.deliveredAt).toLocaleString('en-LK', { timeStyle: 'short', dateStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourierDashboard;
