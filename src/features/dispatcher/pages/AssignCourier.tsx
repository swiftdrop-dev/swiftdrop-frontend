import React, { useState } from 'react';
import { CheckCircle, UserCheck, Search } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, useToast, Modal } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS, MOCK_COURIERS } from '../../../lib/mockData';
import type { Parcel, Courier } from '../../../types/global.types';

const AssignCourier: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState<{ parcel: Parcel; courier?: Courier } | null>(null);
  const [parcels, setParcels] = useState(MOCK_PARCELS);

  const unassigned = parcels.filter(p =>
    p.status === 'pending' &&
    (!search || p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = (parcelId: string, courier: Courier) => {
    const event = {
      status: 'assigned' as const,
      timestamp: new Date().toISOString(),
      note: `Assigned to ${courier.name}`,
    };

    setParcels(ps => ps.map(p => {
      if (p.id === parcelId) {
        const updated = {
          ...p,
          status: 'assigned' as const,
          courierId: courier.id,
          courierName: courier.name,
          courierPhone: courier.phone,
          assignedAt: new Date().toISOString(),
          statusHistory: [...p.statusHistory, event],
        };
        // sync to global
        const gIdx = MOCK_PARCELS.findIndex(gp => gp.id === parcelId);
        if (gIdx !== -1) MOCK_PARCELS[gIdx] = updated as any;
        return updated;
      }
      return p;
    }));

    showToast(`${courier.name} assigned to ${assignModal?.parcel.trackingNumber}`, 'success');
    setAssignModal(null);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Assign Courier</h1>
        <p className="page-subtitle">Assign available couriers to pending parcels</p>
      </div>

      {/* Unassigned Parcels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          Pending Assignment ({unassigned.length})
        </h2>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input placeholder="Search tracking #, recipient..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div className="table-wrapper">
          {unassigned.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>All parcels assigned!</p>
              <p style={{ fontSize: 13 }}>No pending parcels awaiting assignment.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Package</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.senderName}</p>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 14, fontWeight: 600,
                          background: p.senderType === 'merchant' ? 'var(--success-bg)' : 'var(--primary-tint)',
                          color: p.senderType === 'merchant' ? 'var(--success)' : 'var(--primary-light)',
                        }}>
                          {p.senderType.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.recipientName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.recipientPhone}</p>
                    </td>
                    <td style={{ fontSize: 13 }}>{p.pickupAddress.city}</td>
                    <td style={{ fontSize: 13 }}>{p.recipientAddress.city}, {p.recipientAddress.district}</td>
                    <td>
                      <p style={{ fontSize: 13 }}>{p.size.toUpperCase()} · {p.weight}kg</p>
                      {p.fragile && <span style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 600 }}>FRAGILE</span>}
                    </td>
                    <td style={{ fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => setAssignModal({ parcel: p as Parcel })}>
                        <UserCheck size={14} /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Courier Fleet Overview */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
        Fleet Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {MOCK_COURIERS.map((c, i) => (
          <div key={c.id} className="card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'var(--grad)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: 'white',
                }}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em' }}>{c.vehicleType} · {c.vehiclePlate}</span>
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: c.isAvailable ? 'var(--success-bg)' : 'var(--bg-hover)',
                  color: c.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                  border: `1px solid ${c.isAvailable ? 'var(--success-border)' : 'var(--border)'}`,
                }}>
                  {c.isAvailable ? 'Free' : 'Busy'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>⭐ {c.rating}</span>
                <span>{c.deliveriesToday} today</span>
                <span>{c.totalDeliveries} total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Select Courier"
        size="md"
      >
        {assignModal && (
          <div>
            <div style={{
              background: 'var(--bg-overlay)', borderRadius: 14, padding: 14, marginBottom: 20, fontSize: 13,
            }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {assignModal.parcel.trackingNumber}
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                {assignModal.parcel.pickupAddress.city} → {assignModal.parcel.recipientAddress.city}, {assignModal.parcel.recipientAddress.district}
              </p>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Available Couriers
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_COURIERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleAssign(assignModal.parcel.id, c)}
                  disabled={!c.isAvailable}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                    borderRadius: 14, border: `1px solid ${c.isAvailable ? 'var(--border-strong)' : 'var(--border)'}`,
                    background: c.isAvailable ? 'var(--bg-overlay)' : 'var(--bg-hover)',
                    cursor: c.isAvailable ? 'pointer' : 'not-allowed',
                    opacity: c.isAvailable ? 1 : 0.5, width: '100%', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 200ms',
                  }}
                  className={c.isAvailable ? 'hover-highlight' : ''}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--grad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ⭐ {c.rating} · {c.deliveriesToday} deliveries today · {c.vehiclePlate}
                    </p>
                  </div>
                  {c.isAvailable && (
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Assign →</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AssignCourier;
