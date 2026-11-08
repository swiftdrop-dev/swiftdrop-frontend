import React from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Clock, CheckCircle, PlusCircle, BarChart2, Users } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, SimpleBarChart } from '../../../components/shared/SharedComponents';
import { useAuth } from '../../auth/context/AuthContext';
import { MOCK_PARCELS, MOCK_REPORT } from '../../../lib/mockData';

const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const myParcels = MOCK_PARCELS.filter(p => p.senderId === 'usr_002');

  const stats = {
    total: myParcels.length,
    delivered: myParcels.filter(p => p.status === 'delivered').length,
    pending: myParcels.filter(p => ['pending', 'assigned'].includes(p.status)).length,
    revenue: myParcels.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.totalFee, 0),
  };

  const chartData = MOCK_REPORT.dailyStats.map(d => ({ label: d.date, value: d.total }));

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="banner">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {user?.name} Store
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage your business shipments and track performance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/merchant/book" className="btn btn-primary">
            <PlusCircle size={16} /> New Shipment
          </Link>
          <Link to="/merchant/bulk" className="btn btn-secondary">
            <Users size={16} /> Bulk Book
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={stats.total} label="Total Shipments" change={18} variant="primary" />
        <StatCard icon={<CheckCircle size={20} />} value={stats.delivered} label="Delivered" change={22} variant="success" />
        <StatCard icon={<Clock size={20} />} value={stats.pending} label="Awaiting Pickup" variant="warning" />
        <StatCard icon={<TrendingUp size={20} />} value={`Rs. ${stats.revenue.toLocaleString()}`} label="Revenue Collected" change={15} variant="info" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Shipments</span>
            <Link to="/merchant/parcels" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {myParcels.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                    <td>{p.recipientName}</td>
                    <td>{p.recipientAddress.city}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Weekly Volume</span>
              <BarChart2 size={16} color="var(--text-muted)" />
            </div>
            <div className="card-body">
              <SimpleBarChart data={chartData.slice(-7)} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Performance</p>
              {[
                { label: 'Success Rate', value: '94.2%', color: 'var(--success)' },
                { label: 'Avg Delivery Time', value: '1.8 days', color: 'var(--info)' },
                { label: 'COD Collected', value: 'Rs. 12,500', color: 'var(--warning)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MerchantDashboard;
