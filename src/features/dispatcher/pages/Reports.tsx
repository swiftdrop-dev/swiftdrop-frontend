import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Award, Package, CheckCircle2, XCircle, Wallet, Timer } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { SimpleBarChart } from '../../../components/shared/SharedComponents';
import { MOCK_REPORT, MOCK_COURIERS } from '../../../lib/mockData';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  const r = MOCK_REPORT;
  const revenueChart = r.dailyStats.map(d => ({ label: d.date, value: Math.round(d.revenue / 1000) }));
  const deliveryChart = r.dailyStats.map(d => ({ label: d.date, value: d.delivered }));
  const failedChart = r.dailyStats.map(d => ({ label: d.date, value: d.failed }));

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Overview of delivery performance and revenue</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="tabs">
            {(['7d', '30d', 'all'] as const).map(p => (
              <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Parcels', value: r.totalParcels.toLocaleString(), icon: <Package size={16} />, color: 'var(--primary-light)', change: 15 },
          { label: 'Delivered', value: r.deliveredParcels.toLocaleString(), icon: <CheckCircle2 size={16} />, color: 'var(--success)', change: 22 },
          { label: 'Failed', value: r.failedParcels.toLocaleString(), icon: <XCircle size={16} />, color: 'var(--danger)', change: -8 },
          { label: 'Revenue', value: `Rs. ${(r.totalRevenue / 1000).toFixed(0)}k`, icon: <Wallet size={16} />, color: 'var(--warning)', change: 18 },
          { label: 'Success Rate', value: `${r.successRate}%`, icon: <TrendingUp size={16} />, color: 'var(--success)', change: 3 },
          { label: 'Avg Delivery', value: `${r.averageDeliveryTime}h`, icon: <Timer size={16} />, color: 'var(--info)', change: -12 },
        ].map(k => (
          <div key={k.label} className="card animate-fade-in">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ color: k.color, marginBottom: 14 }}>{k.icon}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontStretch: '112%', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1 }}>{k.value}</p>
              <p className="eyebrow">{k.label}</p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11,
                color: k.change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600,
              }}>
                {k.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(k.change)}% vs prev.
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Daily Revenue (Rs. 000s)</span></div>
          <div className="card-body"><SimpleBarChart data={revenueChart} color="var(--success)" /></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Daily Deliveries</span></div>
          <div className="card-body"><SimpleBarChart data={deliveryChart} /></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Failed/Cancelled</span></div>
          <div className="card-body"><SimpleBarChart data={failedChart} color="var(--danger)" /></div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Daily Breakdown</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Parcels</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>Success Rate</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {r.dailyStats.map((d, i) => {
                const rate = ((d.delivered / d.total) * 100).toFixed(1);
                return (
                  <tr key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{d.date}</strong></td>
                    <td>{d.total}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{d.delivered}</td>
                    <td style={{ color: 'var(--danger)' }}>{d.failed}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          height: 5, width: 80, background: 'var(--bg-overlay)', borderRadius: 99, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${rate}%`,
                            background: Number(rate) >= 90 ? 'var(--success)' : Number(rate) >= 75 ? 'var(--warning)' : 'var(--danger)',
                            borderRadius: 99,
                          }} />
                        </div>
                        <span style={{ fontWeight: 600, color: Number(rate) >= 90 ? 'var(--success)' : 'var(--warning)' }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>Rs. {d.revenue.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Couriers */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Top Performing Couriers</span>
          <Award size={16} color="var(--warning)" />
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {MOCK_COURIERS.sort((a, b) => b.totalDeliveries - a.totalDeliveries).map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--bg-overlay)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: i < 3 ? '#000' : 'var(--text-muted)', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--grad)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {c.rating} · {c.vehicleType}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.totalDeliveries}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>deliveries</p>
              </div>
              <div style={{ width: 100 }}>
                <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(c.totalDeliveries / 600) * 100}%`,
                    background: 'var(--signal)',
                    borderRadius: 99,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
