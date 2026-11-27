import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity, BarChart2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, SimpleBarChart } from '../../../components/shared/SharedComponents';
import { reportsApi } from '../api/reports.api';
import { adminParcelsApi } from '../api/admin-parcels.api';
import { courierApi } from '../../courier/api/courier.api';
import type { DashboardKpis, ParcelVolumeReport } from '../types/reports.types';
import type { CourierProfile } from '../../courier/types/courier.types';
import type { ParcelBookingResponse } from '../../customer/services/customer-parcel.api';

const DispatcherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [volumeReport, setVolumeReport] = useState<ParcelVolumeReport | null>(null);
  const [recentParcels, setRecentParcels] = useState<ParcelBookingResponse[]>([]);
  const [couriers, setCouriers] = useState<CourierProfile[]>([]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [kpisRes, volumeRes, parcelsRes, couriersRes] = await Promise.allSettled([
        reportsApi.getDashboardKpis(),
        reportsApi.getParcelVolume(7),
        adminParcelsApi.getAllParcels({ page: 0, size: 6 }),
        courierApi.getAllCouriers(),
      ]);

      if (kpisRes.status === 'fulfilled' && kpisRes.value) {
        setKpis(kpisRes.value);
      } else if (kpisRes.status === 'rejected') {
        setError('Reporting service currently unavailable');
      }

      if (volumeRes.status === 'fulfilled' && volumeRes.value) {
        setVolumeReport(volumeRes.value);
      }
      if (parcelsRes.status === 'fulfilled' && parcelsRes.value?.content) {
        setRecentParcels(parcelsRes.value.content);
      }
      if (couriersRes.status === 'fulfilled' && Array.isArray(couriersRes.value)) {
        setCouriers(couriersRes.value);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load operations dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = {
    total: kpis?.totalParcels ?? null,
    pending: (kpis?.pendingParcels !== null && kpis?.pendingParcels !== undefined)
      ? (kpis.pendingParcels + (kpis.unassignedDeliveries ?? 0))
      : null,
    inTransit: (kpis?.inTransitDeliveries !== null && kpis?.inTransitDeliveries !== undefined)
      ? (kpis.inTransitDeliveries + (kpis.assignedDeliveries ?? 0))
      : null,
    delivered: kpis?.deliveredParcels ?? null,
    failed: kpis?.failedDeliveries ?? null,
    activeCouriers: kpis?.activeCouriers ?? null,
    totalCouriers: kpis?.totalCouriers ?? couriers.length,
    revenue: kpis?.totalRevenue ?? null,
    successRate: kpis?.successRate ?? null,
    avgHours: kpis?.averageDeliveryTimeHours ?? null,
  };

  const chartData = (volumeReport?.dailyStats && volumeReport.dailyStats.length > 0)
    ? volumeReport.dailyStats.map(d => ({ label: d.date, value: d.delivered }))
    : [];

  const fmt = (val: number | null | undefined, suffix = '', fallback = '—') => {
    if (val === null || val === undefined) return fallback;
    return `${val.toLocaleString()}${suffix}`;
  };

  const getDestinationDisplay = (address: unknown): string => {
    if (!address) return 'N/A';
    if (typeof address === 'string') {
      const parts = address.split(',');
      return parts[parts.length - 1]?.trim() || address;
    }
    const addrObj = address as { city?: string; district?: string };
    return addrObj.city || addrObj.district || 'N/A';
  };

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
              {stats.pending !== null ? `${stats.pending} parcels awaiting assignment` : 'Parcels status loading'} · {stats.activeCouriers !== null ? `${stats.activeCouriers} couriers available` : 'Couriers status loading'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            title="Refresh operational metrics"
          >
            <RefreshCw size={16} className={loading || refreshing ? 'animate-spin' : ''} />
            {loading || refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/dispatcher/assign" className="btn btn-primary">
            <Users size={16} /> Assign Courier
          </Link>
          <Link to="/dispatcher/reports" className="btn btn-secondary">
            <BarChart2 size={16} /> Reports
          </Link>
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
              <strong style={{ color: '#eab308' }}>Partial Reporting Notice:</strong> Core metrics are active, but some secondary services are currently unreachable ({unreachable.join(', ')}). Missing metrics are represented as &quot;—&quot;.
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
          <button className="btn btn-secondary btn-sm" onClick={() => loadData()}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={fmt(stats.total)} label="Total Parcels" variant="primary" />
        <StatCard icon={<Clock size={20} />} value={fmt(stats.pending)} label="Awaiting Assignment" variant="warning" />
        <StatCard icon={<TrendingUp size={20} />} value={fmt(stats.inTransit)} label="In Transit" variant="info" />
        <StatCard icon={<CheckCircle size={20} />} value={fmt(stats.delivered)} label="Delivered" variant="success" />
        <StatCard icon={<AlertTriangle size={20} />} value={fmt(stats.failed)} label="Failed/Cancelled" variant="danger" />
        <StatCard icon={<Users size={20} />} value={fmt(stats.activeCouriers)} label="Active Couriers" variant="info" />
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
                    <th>Sender</th>
                    <th>Destination</th>
                    <th>Courier</th>
                    <th>Status</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {recentParcels.length > 0 ? (
                    recentParcels.map((p, i) => (
                      <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <td>
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                            {p.trackingNumber}
                          </strong>
                        </td>
                        <td>{p.senderName || 'Anonymous'}</td>
                        <td>{getDestinationDisplay(p.recipientAddress)}</td>
                        <td>
                          {p.courierId ? (
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Courier #{p.courierId}</span>
                          ) : (
                            <span style={{ color: 'var(--warning)' }}>Unassigned</span>
                          )}
                        </td>
                        <td><StatusBadge status={p.status as any} /></td>
                        <td style={{ fontWeight: 600 }}>
                          {p.totalFee !== null && p.totalFee !== undefined ? `Rs. ${p.totalFee.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading parcels...' : 'No recent parcels recorded'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Courier Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Courier Fleet</span>
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                {stats.activeCouriers !== null ? `${stats.activeCouriers}/${stats.totalCouriers} Available` : '—'}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {couriers.length > 0 ? (
                couriers.map((c, i) => {
                  const isAvail = c.available ?? (c as any).isAvailable ?? false;
                  return (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 0', borderBottom: i < couriers.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {(c.name || 'CR').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{c.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {c.vehicleType || 'Motorcycle'} · {c.vehiclePlate || 'N/A'} · ⭐ {c.rating !== null && c.rating !== undefined ? c.rating : '—'} · {c.deliveriesToday ?? 0} today
                        </p>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: isAvail ? 'var(--success-bg)' : 'var(--bg-hover)',
                        color: isAvail ? 'var(--success)' : 'var(--text-muted)',
                        border: `1px solid ${isAvail ? 'var(--success-border)' : 'var(--border)'}`,
                      }}>
                        {isAvail ? '● Available' : '○ Busy'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading couriers...' : 'No couriers registered'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Revenue */}
          <div className="card">
            <div className="card-header"><span className="card-title">Revenue Total</span></div>
            <div className="card-body">
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-light)', marginBottom: 4 }}>
                {stats.revenue !== null ? `Rs. ${(stats.revenue / 1000).toFixed(0)}k` : '—'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--success)' }}>
                {kpis ? 'Live platform revenue' : 'Platform revenue'}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div className="card-header"><span className="card-title">Daily Deliveries</span></div>
            <div className="card-body">
              {chartData.length > 0 ? (
                <SimpleBarChart data={chartData} />
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {loading ? 'Loading volume data...' : 'No delivery data recorded for this period'}
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Key Metrics</p>
              {[
                { label: 'Success Rate', value: stats.successRate !== null ? `${stats.successRate}%` : '—', color: 'var(--success)' },
                { label: 'Avg Delivery Time', value: stats.avgHours !== null ? `${stats.avgHours}h` : '—', color: 'var(--info)' },
                { label: 'Total Parcels', value: fmt(stats.total), color: 'var(--primary-light)' },
                {
                  label: 'Failed Rate',
                  value: (stats.total !== null && stats.failed !== null && stats.total > 0)
                    ? `${((stats.failed / stats.total) * 100).toFixed(1)}%`
                    : '—',
                  color: 'var(--danger)',
                },
                { label: 'Registered Customers', value: fmt(kpis?.registeredCustomers), color: 'var(--text-primary)' },
                { label: 'Registered Merchants', value: fmt(kpis?.registeredMerchants), color: 'var(--text-primary)' },
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
