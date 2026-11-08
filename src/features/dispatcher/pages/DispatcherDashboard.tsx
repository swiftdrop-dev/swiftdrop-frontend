import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, SimpleBarChart } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS, MOCK_COURIERS, MOCK_REPORT } from '../../../lib/mockData';

const DispatcherDashboard: React.FC = () => {
  const stats = {
    total: MOCK_PARCELS.length,
    pending: MOCK_PARCELS.filter(p => p.status === 'pending').length,
    inTransit: MOCK_PARCELS.filter(p => ['assigned', 'picked_up', 'in_transit'].includes(p.status)).length,
    delivered: MOCK_PARCELS.filter(p => p.status === 'delivered').length,
    failed: MOCK_PARCELS.filter(p => p.status === 'failed' || p.status === 'cancelled').length,
    activeCouriers: MOCK_COURIERS.filter(c => c.isAvailable).length,
    revenue: MOCK_REPORT.totalRevenue,
  };

  const chartData = MOCK_REPORT.dailyStats.map(d => ({ label: d.date, value: d.delivered }));
  const recentParcels = MOCK_PARCELS.slice(0, 6);

  return (
    <DashboardLayout>
      {/* Hero */}
      <div className="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="banner-icon">
            <Activity size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Operations Control Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {stats.pending} parcels awaiting assignment · {stats.activeCouriers} couriers available
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/dispatcher/assign" className="btn btn-primary">
            <Users size={16} /> Assign Courier
          </Link>
          <Link to="/dispatcher/reports" className="btn btn-secondary">
            <BarChart2 size={16} /> Reports
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={stats.total} label="Total Parcels" change={15} variant="primary" />
        <StatCard icon={<Clock size={20} />} value={stats.pending} label="Awaiting Assignment" variant="warning" />
        <StatCard icon={<TrendingUp size={20} />} value={stats.inTransit} label="In Transit" variant="info" />
        <StatCard icon={<CheckCircle size={20} />} value={stats.delivered} label="Delivered" change={22} variant="success" />
        <StatCard icon={<AlertTriangle size={20} />} value={stats.failed} label="Failed/Cancelled" variant="danger" />
        <StatCard icon={<Users size={20} />} value={stats.activeCouriers} label="Active Couriers" variant="info" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Parcels */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Parcels</span>
              <Link to="/dispatcher/parcels" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>From</th>
                    <th>Destination</th>
                    <th>Courier</th>
                    <th>Status</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {recentParcels.map((p, i) => (
                    <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                      <td>{p.senderName}</td>
                      <td>{p.recipientAddress.city}</td>
                      <td>{p.courierName ?? <span style={{ color: 'var(--warning)' }}>Unassigned</span>}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Courier Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Courier Fleet</span>
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                {stats.activeCouriers}/{MOCK_COURIERS.length} Available
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_COURIERS.map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: i < MOCK_COURIERS.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--grad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {c.vehicleType} · {c.vehiclePlate} · ⭐ {c.rating} · {c.deliveriesToday} today
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: c.isAvailable ? 'var(--success-bg)' : 'var(--bg-hover)',
                    color: c.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                    border: `1px solid ${c.isAvailable ? 'var(--success-border)' : 'var(--border)'}`,
                  }}>
                    {c.isAvailable ? '● Available' : '○ Busy'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Revenue */}
          <div className="card">
            <div className="card-header"><span className="card-title">Revenue (7 days)</span></div>
            <div className="card-body">
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-light)', marginBottom: 4 }}>
                Rs. {(MOCK_REPORT.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p style={{ fontSize: 13, color: 'var(--success)' }}>↑ 18% from last week</p>
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div className="card-header"><span className="card-title">Daily Deliveries</span></div>
            <div className="card-body">
              <SimpleBarChart data={chartData} />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Key Metrics</p>
              {[
                { label: 'Success Rate', value: `${MOCK_REPORT.successRate}%`, color: 'var(--success)' },
                { label: 'Avg Delivery Time', value: `${MOCK_REPORT.averageDeliveryTime}h`, color: 'var(--info)' },
                { label: 'Total Parcels', value: MOCK_REPORT.totalParcels.toLocaleString(), color: 'var(--primary-light)' },
                { label: 'Failed Rate', value: `${((MOCK_REPORT.failedParcels / MOCK_REPORT.totalParcels) * 100).toFixed(1)}%`, color: 'var(--danger)' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DispatcherDashboard;
