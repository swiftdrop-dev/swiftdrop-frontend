import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, Package, Star, Truck } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { EmptyState, StatCard } from '../../../components/shared/SharedComponents';
import { courierApi } from '../api/courier.api';
import { courierDeliveriesApi } from '../api/deliveries.api';

const CourierDashboard: React.FC = () => {
  const {
    data: courier,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['courier', 'me'],
    queryFn: courierApi.getCurrentProfile,
  });

  const { data: jobOffers } = useQuery({
    queryKey: ['courier', 'job-offers'],
    queryFn: courierDeliveriesApi.getJobOffers,
    refetchInterval: 15000,
  });

  const pendingOffersCount = (jobOffers ?? []).filter(
    job => job.status === 'ASSIGNED_PENDING_ACCEPTANCE'
  ).length;

  const availability = courier?.available == null
    ? 'Availability unavailable'
    : courier.available ? 'Available' : 'Off duty';

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Courier Dashboard</h1>
        <p className="page-subtitle">Your courier profile and delivery overview</p>
      </div>

      {isPending && (
        <div className="card" role="status" aria-live="polite" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading your courier profile…</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="card" style={{ marginBottom: 24 }}>
          <EmptyState
            icon={<AlertCircle size={26} strokeWidth={1.5} />}
            title="Courier profile unavailable"
            description="We couldn't load your profile. Check your connection and try again."
            action={
              <button className="btn btn-primary" onClick={() => void refetch()} disabled={isFetching}>
                {isFetching ? 'Retrying…' : 'Retry'}
              </button>
            }
          />
        </div>
      )}

      {pendingOffersCount > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: '16px 20px',
            border: '1px solid var(--warning-border, #f59e0b40)',
            background: 'var(--warning-bg, #fef3c720)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, background: 'var(--warning)', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <Package size={18} />
            </div>
            <div>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                You have {pendingOffersCount} new delivery offer{pendingOffersCount > 1 ? 's' : ''}!
              </strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Review and accept or decline incoming jobs in your deliveries tab.
              </p>
            </div>
          </div>
          <Link to="/courier/deliveries" className="btn btn-primary btn-sm">
            Review Offers
          </Link>
        </div>
      )}

      {courier && (
        <>
          <div className="banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
              <div className="banner-icon">
                <Truck size={26} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  Welcome, {courier.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} fill="var(--warning)" color="var(--warning)" />
                    {courier.rating == null ? 'Rating unavailable' : courier.rating.toFixed(1) + ' Rating'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{courier.vehicleType ?? 'Vehicle not listed'}</span>
                  {courier.vehiclePlate && <span>· {courier.vehiclePlate}</span>}
                  <span aria-hidden="true">·</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: courier.available ? 'var(--success)' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: courier.available ? 'var(--success)' : 'var(--text-muted)',
                      display: 'inline-block',
                    }} />
                    {availability}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/courier/deliveries" className="btn btn-warning">
              <Truck size={16} /> View Deliveries
            </Link>
          </div>

          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard icon={<Package size={20} />} value={courier.deliveriesToday ?? '—'} label="Deliveries Today" variant="warning" />
            <StatCard icon={<CheckCircle size={20} />} value={courier.totalDeliveries ?? '—'} label="Total Deliveries" variant="success" />
            <StatCard icon={<Clock size={20} />} value={availability} label="Availability" variant={courier.available ? 'primary' : 'info'} />
            <StatCard
              icon={<Star size={20} />}
              value={courier.rating == null ? '—' : courier.rating.toFixed(1)}
              label="Courier Rating"
              variant="info"
            />
          </div>
        </>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">Assigned deliveries</span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your live delivery queue is available on the assigned deliveries page.</p>
          </div>
          <Link to="/courier/deliveries" className="btn btn-ghost btn-sm">View Deliveries</Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourierDashboard;
