import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Award, Package, CheckCircle2, XCircle, Wallet, Timer, RefreshCw, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { SimpleBarChart } from '../../../components/shared/SharedComponents';
import { reportsApi } from '../api/reports.api';
import type { DashboardKpis, ParcelVolumeReport, CourierPerformanceItem } from '../types/reports.types';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [volume, setVolume] = useState<ParcelVolumeReport | null>(null);
  const [courierPerf, setCourierPerf] = useState<CourierPerformanceItem[]>([]);

  const daysForPeriod = period === '7d' ? 7 : period === '30d' ? 30 : 90;

  const loadReportData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [kpisRes, volumeRes, courierRes] = await Promise.allSettled([
        reportsApi.getDashboardKpis(),
        reportsApi.getParcelVolume(daysForPeriod),
        reportsApi.getCourierPerformance(),
      ]);

      if (kpisRes.status === 'fulfilled' && kpisRes.value) {
        setKpis(kpisRes.value);
      } else if (kpisRes.status === 'rejected') {
        setError('Operational reporting service is temporarily unavailable');
      }

      if (volumeRes.status === 'fulfilled' && volumeRes.value) {
        setVolume(volumeRes.value);
      }
      if (courierRes.status === 'fulfilled' && courierRes.value?.couriers) {
        setCourierPerf(courierRes.value.couriers);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [period]);

  const dailyStats = Array.isArray(volume?.dailyStats) ? volume.dailyStats : [];

  const revenueChart = dailyStats.map(d => ({
    label: d.date,
    value: Math.round((d.revenue || 0) / 1000),
  }));
  const deliveryChart = dailyStats.map(d => ({
    label: d.date,
    value: d.delivered || 0,
  }));
  const failedChart = dailyStats.map(d => ({
    label: d.date,
    value: d.failed || 0,
  }));

  const totalParcels = kpis?.totalParcels ?? null;
  const deliveredParcels = kpis?.deliveredParcels ?? null;
  const failedParcels = kpis?.failedDeliveries ?? null;
  const totalRevenue = kpis?.totalRevenue ?? null;
  const successRate = kpis?.successRate ?? null;
  const avgDeliveryTime = kpis?.averageDeliveryTimeHours ?? null;

  const fmt = (val: number | null | undefined, suffix = '', fallback = '—') => {
    if (val === null || val === undefined) return fallback;
    return `${val.toLocaleString()}${suffix}`;
  };

  const handleExportCsv = () => {
    if (dailyStats.length === 0) return;
    const headers = ['Date', 'Total Parcels', 'Delivered', 'Failed', 'Success Rate (%)', 'Revenue (LKR)'];
    const rows = dailyStats.map(d => {
      const rate = d.total > 0 ? ((d.delivered / d.total) * 100).toFixed(1) : '0.0';
      return [d.date, d.total, d.delivered, d.failed, rate, d.revenue];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `swiftdrop-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayCouriers = courierPerf;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Overview of delivery performance and revenue</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="tabs">
            {(['7d', '30d', 'all'] as const).map(p => (
              <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => loadReportData(true)}
            disabled={loading || refreshing}
            title="Refresh reports data"
          >
            <RefreshCw size={14} className={loading || refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCsv}
            disabled={dailyStats.length === 0}
            title={dailyStats.length === 0 ? 'No data available to export' : 'Export report as CSV'}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Partial Data Notice Banner - only display if actual secondary services are DOWN / unreachable */}
      {(() => {
        const unreachable = kpis?.sourceAvailability
          ? Object.entries(kpis.sourceAvailability).filter(([_, s]) => s === 'DOWN').map(([srv]) => srv)
          : [];
        if (unreachable.length === 0) return null;
        return (
          <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text-primary)',
          }}>
            <AlertTriangle size={20} color="#eab308" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#eab308' }}>Partial Reporting Notice:</strong> Some secondary services are currently unreachable ({unreachable.join(', ')}). Missing metrics are shown as &quot;—&quot;.
            </div>
          </div>
        );
      })()}

      {error && !kpis && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadReportData()}>Retry</button>
        </div>
      )}

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Parcels', value: fmt(totalParcels), icon: <Package size={16} />, color: 'var(--primary-light)' },
          { label: 'Delivered', value: fmt(deliveredParcels), icon: <CheckCircle2 size={16} />, color: 'var(--success)' },
          { label: 'Failed', value: fmt(failedParcels), icon: <XCircle size={16} />, color: 'var(--danger)' },
          { label: 'Revenue', value: totalRevenue !== null ? `Rs. ${(totalRevenue / 1000).toFixed(0)}k` : '—', icon: <Wallet size={16} />, color: 'var(--warning)' },
          { label: 'Success Rate', value: successRate !== null ? `${successRate}%` : '—', icon: <TrendingUp size={16} />, color: 'var(--success)' },
          { label: 'Avg Delivery', value: avgDeliveryTime !== null ? `${avgDeliveryTime}h` : '—', icon: <Timer size={16} />, color: 'var(--info)' },
        ].map(k => (
          <div key={k.label} className="card animate-fade-in">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ color: k.color, marginBottom: 14 }}>{k.icon}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontStretch: '112%', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1 }}>{k.value}</p>
              <p className="eyebrow">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Daily Revenue (Rs. 000s)</span></div>
          <div className="card-body">
            {revenueChart.length > 0 ? (
              <SimpleBarChart data={revenueChart} color="var(--success)" />
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No revenue data
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Daily Deliveries</span></div>
          <div className="card-body">
            {deliveryChart.length > 0 ? (
              <SimpleBarChart data={deliveryChart} />
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No delivery data
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Failed/Cancelled</span></div>
          <div className="card-body">
            {failedChart.length > 0 ? (
              <SimpleBarChart data={failedChart} color="var(--danger)" />
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No failure data
              </div>
            )}
          </div>
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
              {dailyStats.length > 0 ? (
                dailyStats.map((d, i) => {
                  const rate = d.total > 0 ? ((d.delivered / d.total) * 100).toFixed(1) : '0.0';
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
                      <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>Rs. {(d.revenue || 0).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading daily stats...' : 'No daily volume recorded for this period'}
                  </td>
                </tr>
              )}
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
          {displayCouriers.length > 0 ? (
            displayCouriers.sort((a, b) => (b.totalDeliveries || 0) - (a.totalDeliveries || 0)).map((c, i) => (
              <div key={c.courierId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                  {(c.name || 'CR').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {c.rating !== null && c.rating !== undefined ? c.rating : '—'} · {c.vehicleType || 'Motorcycle'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.totalDeliveries || 0}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>deliveries</p>
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, ((c.totalDeliveries || 0) / 600) * 100)}%`,
                      background: 'var(--signal)',
                      borderRadius: 99,
                    }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {loading ? 'Loading courier stats...' : 'No courier performance data available'}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
