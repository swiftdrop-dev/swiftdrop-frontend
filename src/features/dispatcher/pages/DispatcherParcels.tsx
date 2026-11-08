import React, { useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, EmptyState, Modal, StatusTimeline } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';
import type { Parcel } from '../../../types/global.types';

const DispatcherParcels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  const filtered = MOCK_PARCELS.filter(p => {
    const matchSearch = !search ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">All Parcels</h1>
        <p className="page-subtitle">Complete overview of every parcel in the system</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tabs">
          {statuses.map(s => (
            <button key={s} className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>
              {s === 'all' ? `All (${MOCK_PARCELS.length})` : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={16} />
          <input placeholder="Search tracking #, sender, recipient..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
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
                {filtered.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                        {p.trackingNumber}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{p.senderName}</p>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 14, fontWeight: 700,
                          background: p.senderType === 'merchant' ? 'var(--success-bg)' : 'var(--primary-tint)',
                          color: p.senderType === 'merchant' ? 'var(--success)' : 'var(--primary-light)',
                        }}>
                          {p.senderType.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{p.recipientName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{p.pickupAddress.city}</span>
                      <span style={{ color: 'var(--text-muted)' }}> → </span>
                      <span>{p.recipientAddress.city}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {p.courierName ?? <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 12 }}>Unassigned</span>}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-LK')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedParcel(p as Parcel)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {MOCK_PARCELS.length} parcels
        </div>
      </div>

      <Modal isOpen={!!selectedParcel} onClose={() => setSelectedParcel(null)}
        title={selectedParcel?.trackingNumber ?? ''} size="md">
        {selectedParcel && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: 13 }}>
              {[
                ['Sender', selectedParcel.senderName],
                ['Recipient', selectedParcel.recipientName],
                ['Pickup', `${selectedParcel.pickupAddress.city}, ${selectedParcel.pickupAddress.district}`],
                ['Delivery', `${selectedParcel.recipientAddress.city}, ${selectedParcel.recipientAddress.district}`],
                ['Package', `${selectedParcel.description} · ${selectedParcel.size.toUpperCase()} · ${selectedParcel.weight}kg`],
                ['Courier', selectedParcel.courierName ?? 'Not assigned'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{k}</p>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
            <StatusTimeline history={selectedParcel.statusHistory} currentStatus={selectedParcel.status} />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default DispatcherParcels;
