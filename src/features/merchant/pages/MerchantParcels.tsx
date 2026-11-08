import React, { useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, EmptyState, Modal, StatusTimeline } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';
import type { Parcel } from '../../../types/global.types';

const MerchantParcels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  const myParcels = MOCK_PARCELS.filter(p => p.senderId === 'usr_002');

  const filtered = myParcels.filter(p => {
    const matchSearch = !search ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">All Shipments</h1>
        <p className="page-subtitle">Manage and track all your merchant shipments</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="tabs">
          {['all', 'pending', 'in_transit', 'delivered', 'cancelled'].map(s => (
            <button key={s} className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input placeholder="Search tracking #, recipient..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
            <EmptyState title="No shipments found" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>Destination</th>
                  <th>Package</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.recipientName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                      </div>
                    </td>
                    <td>{p.recipientAddress.city}, {p.recipientAddress.district}</td>
                    <td>{p.description}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.size.toUpperCase()} · {p.weight}kg</span></td>
                    <td>{p.courierName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td><span className={`badge ${p.paymentStatus === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>{p.paymentStatus}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-LK')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedParcel(p)}>Track</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedParcel} onClose={() => setSelectedParcel(null)} title={`Tracking: ${selectedParcel?.trackingNumber}`} size="md">
        {selectedParcel && <StatusTimeline history={selectedParcel.statusHistory} currentStatus={selectedParcel.status} />}
      </Modal>
    </DashboardLayout>
  );
};

export default MerchantParcels;
