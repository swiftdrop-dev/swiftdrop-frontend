import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, EmptyState, Modal, StatusTimeline } from '../../../components/shared/SharedComponents';
import { adminParcelsApi } from '../api/admin-parcels.api';
import type { ParcelBookingResponse } from '../../customer/services/customer-parcel.api';

const DispatcherParcels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState<ParcelBookingResponse | null>(null);
  const [parcels, setParcels] = useState<ParcelBookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const statuses = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

  const fetchParcels = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminParcelsApi.getAllParcels({
        query: search.trim() || undefined,
        status: statusFilter,
        page: pageNum,
        size: 15,
      });

      if (res && res.content) {
        setParcels(res.content);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || res.content.length);
        setPage(res.number || pageNum);
      }
    } catch (err: unknown) {
      setParcels([]);
      setTotalPages(1);
      setTotalElements(0);
      setError(err instanceof Error ? err.message : 'Failed to retrieve parcels');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParcels(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchParcels]);

  const formatCity = (addr: unknown): string => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') {
      const parts = addr.split(',');
      return parts[parts.length - 1]?.trim() || addr;
    }
    const obj = addr as { city?: string; district?: string };
    return obj.city || obj.district || 'N/A';
  };

  const formatFullAddress = (addr: unknown): string => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    const obj = addr as { street?: string; city?: string; district?: string };
    return [obj.street, obj.city, obj.district].filter(Boolean).join(', ');
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">All Parcels</h1>
        <p className="page-subtitle">Complete operational oversight of every parcel in the system</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tabs">
          {statuses.map(s => (
            <button
              key={s}
              className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(s);
                setPage(0);
              }}
            >
              {s === 'all' ? `All (${totalElements})` : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            placeholder="Search tracking #, sender, recipient..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => fetchParcels(page)}
          disabled={loading}
          title="Refresh parcels list"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
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
          <button className="btn btn-secondary btn-sm" onClick={() => fetchParcels(page)}>Retry</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {parcels.length === 0 && !loading ? (
            <EmptyState title="No parcels found" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Route</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Payment</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                        {p.trackingNumber}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{p.senderName || 'Anonymous'}</p>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 14, fontWeight: 700,
                          background: 'var(--primary-tint)',
                          color: 'var(--primary-light)',
                        }}>
                          {(p as any).senderType ? (p as any).senderType.toUpperCase() : 'PARCEL'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{p.recipientName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{formatCity(p.pickupAddress)}</span>
                      <span style={{ color: 'var(--text-muted)' }}> → </span>
                      <span>{formatCity(p.recipientAddress)}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {p.courierId ? (
                        <span style={{ fontWeight: 600 }}>Courier #{p.courierId}</span>
                      ) : (
                        <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 12 }}>Unassigned</span>
                      )}
                    </td>
                    <td><StatusBadge status={p.status as any} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                      Rs. {(p.totalFee ?? 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>
                        {p.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-LK') : '—'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedParcel(p)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with pagination */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            Showing {parcels.length} of {totalElements} parcels
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fetchParcels(page - 1)}
                disabled={page <= 0 || loading}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fetchParcels(page + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedParcel}
        onClose={() => setSelectedParcel(null)}
        title={selectedParcel?.trackingNumber ?? ''}
        size="md"
      >
        {selectedParcel && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: 13 }}>
              {[
                ['Sender', `${selectedParcel.senderName || 'Anonymous'} (${selectedParcel.senderPhone || 'N/A'})`],
                ['Recipient', `${selectedParcel.recipientName} (${selectedParcel.recipientPhone})`],
                ['Pickup Address', formatFullAddress(selectedParcel.pickupAddress)],
                ['Delivery Address', formatFullAddress(selectedParcel.recipientAddress)],
                ['Package', `${selectedParcel.description || 'Standard'} · ${(selectedParcel.parcelSize || 'M').toUpperCase()} · ${selectedParcel.weightKg || (selectedParcel as any).weight || 1}kg`],
                ['Courier', selectedParcel.courierId ? `Courier #${selectedParcel.courierId}` : 'Not assigned'],
                ['Total Fee', `Rs. ${(selectedParcel.totalFee ?? 0).toLocaleString()} (${selectedParcel.paymentStatus || 'pending'})`],
                ['Payment Method', (selectedParcel.paymentMethod || 'COD').toUpperCase()],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{k}</p>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
            {selectedParcel.status && (
              <StatusTimeline
                history={(selectedParcel as any).statusHistory || [
                  { status: selectedParcel.status as any, timestamp: selectedParcel.createdAt || new Date().toISOString() },
                ]}
                currentStatus={selectedParcel.status as any}
              />
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default DispatcherParcels;
