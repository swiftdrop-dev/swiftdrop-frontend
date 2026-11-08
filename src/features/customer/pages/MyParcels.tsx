import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, FileText, Download } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, EmptyState, Modal, StatusTimeline } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';
import type { Parcel } from '../../../types/global.types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const MyParcels: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showReceipt, setShowReceipt] = useState<Parcel | null>(null);

  const myParcels = MOCK_PARCELS.filter(p => p.senderId === 'usr_001');

  const filtered = myParcels.filter(p => {
    const matchSearch = !search ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'in_progress' && ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(p.status)) ||
      p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Parcels</h1>
        <p className="page-subtitle">All your bookings and shipments</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="tabs">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} className={`tab-btn ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input placeholder="Search by tracking #, recipient..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Link to="/customer/book" className="btn btn-primary btn-sm">
            <Package size={14} /> New Booking
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
            <EmptyState title="No parcels found" description="Try adjusting your search or filters." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>To</th>
                  <th>Size/Weight</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                        {p.trackingNumber}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.recipientName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                      </div>
                    </td>
                    <td>{p.recipientAddress.city}, {p.recipientAddress.district}</td>
                    <td>{p.size.toUpperCase()} · {p.weight}kg</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-LK')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedParcel(p)}>
                          Track
                        </button>
                        {p.status === 'delivered' && (
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setShowReceipt(p)}>
                            <FileText size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      <Modal
        isOpen={!!selectedParcel}
        onClose={() => setSelectedParcel(null)}
        title={`Tracking: ${selectedParcel?.trackingNumber}`}
        size="lg"
      >
        {selectedParcel && (
          <StatusTimeline
            history={selectedParcel.statusHistory}
            currentStatus={selectedParcel.status}
          />
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={!!showReceipt}
        onClose={() => setShowReceipt(null)}
        title="Delivery Receipt"
        footer={
          <button className="btn btn-primary btn-sm" onClick={() => setShowReceipt(null)}>
            <Download size={14} /> Download PDF
          </button>
        }
      >
        {showReceipt && (
          <div className="receipt">
            <div className="receipt-header">
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>SwiftDrop — Delivery Receipt</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800 }}>{showReceipt.trackingNumber}</p>
              <p style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>Delivered Successfully</p>
            </div>
            <div className="receipt-body">
              {[
                ['Recipient', showReceipt.recipientName],
                ['Phone', showReceipt.recipientPhone],
                ['Address', `${showReceipt.recipientAddress.street}, ${showReceipt.recipientAddress.city}`],
                ['Package', showReceipt.description],
                ['Weight', `${showReceipt.weight} kg`],
                ['Courier', showReceipt.courierName ?? '—'],
                ['Delivered', showReceipt.deliveredAt ? new Date(showReceipt.deliveredAt).toLocaleString('en-LK') : '—'],
                ['Payment', showReceipt.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'],
                ['Delivery Fee', `Rs. ${showReceipt.totalFee.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="receipt-row">
                  <span className="receipt-row-label">{label}</span>
                  <span className="receipt-row-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default MyParcels;
