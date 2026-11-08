import React, { useState } from 'react';
import { MapPin, Phone, Package, CheckCircle, Truck, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, Modal, useToast } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';
import type { Parcel, ParcelStatus } from '../../../types/global.types';

const STATUS_FLOW: ParcelStatus[] = ['assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  assigned: 'Mark as Picked Up',
  picked_up: 'Mark In Transit',
  in_transit: 'Out for Delivery',
  out_for_delivery: 'Mark as Delivered',
};

const AssignedDeliveries: React.FC = () => {
  const { showToast } = useToast();
  const [parcels, setParcels] = useState<Parcel[]>(
    MOCK_PARCELS.filter(p => p.courierId === 'cou_001' && p.status !== 'delivered' && p.status !== 'cancelled') as Parcel[]
  );
  const [selected, setSelected] = useState<Parcel | null>(null);

  const nextStatus = (current: ParcelStatus): ParcelStatus | null => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const updateStatus = (parcelId: string, newStatus: ParcelStatus) => {
    const event = { status: newStatus, timestamp: new Date().toISOString(), note: `Status updated by courier` };

    setParcels(ps => ps.map(p => {
      if (p.id === parcelId) {
        const updated = {
          ...p,
          status: newStatus,
          statusHistory: [...p.statusHistory, event],
          ...(newStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {}),
        };
        // sync to global mock
        const globalIdx = MOCK_PARCELS.findIndex(gp => gp.id === parcelId);
        if (globalIdx !== -1) MOCK_PARCELS[globalIdx] = updated as any;
        return updated;
      }
      return p;
    }));

    showToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'success');
    setSelected(null);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Deliveries</h1>
        <p className="page-subtitle">Update delivery statuses and manage your route</p>
      </div>

      {parcels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 20px', display: 'grid', placeItems: 'center', background: 'var(--grad)', color: 'var(--signal)', borderRadius: 12 }}><CheckCircle size={32} /></div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>All clear!</h3>
          <p>You have no active deliveries right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {parcels.map((parcel, i) => {
            const next = nextStatus(parcel.status);
            return (
              <div
                key={parcel.id}
                className="card animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, borderLeft: parcel.fragile ? '3px solid var(--warning)' : undefined }}
              >
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--primary-light)' }}>
                          {parcel.trackingNumber}
                        </span>
                        <StatusBadge status={parcel.status} />
                        {parcel.fragile && (
                          <span style={{
                            background: 'var(--warning-bg)', color: 'var(--warning)',
                            fontSize: 11, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--warning-border)', fontWeight: 600,
                          }}>
                            FRAGILE
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Recipient</p>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{parcel.recipientName}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Phone size={12} /> {parcel.recipientPhone}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Drop Address</p>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <MapPin size={13} style={{ marginTop: 2, color: 'var(--primary-light)', flexShrink: 0 }} />
                            <span>{parcel.recipientAddress.street},<br />{parcel.recipientAddress.city}, {parcel.recipientAddress.district}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Package</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Package size={12} /> {parcel.description}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{parcel.size.toUpperCase()} · {parcel.weight}kg</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Payment</p>
                          <span className={`badge ${parcel.paymentMethod === 'cod' ? 'badge-warning' : 'badge-delivered'}`} style={{ fontSize: 12 }}>
                            {parcel.paymentMethod === 'cod' ? 'Collect COD' : 'Online Paid'}
                          </span>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Rs. {parcel.totalFee.toLocaleString()}</p>
                        </div>
                      </div>

                      {parcel.specialInstructions && (
                        <div style={{
                          marginTop: 14, padding: '8px 12px', background: 'var(--warning-bg)',
                          border: '1px solid var(--warning-border)', borderRadius: 10,
                          fontSize: 13, color: 'var(--warning)',
                        }}>
                          {parcel.specialInstructions}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                      {next && (
                        <button
                          className={`btn btn-${next === 'delivered' ? 'success' : 'primary'}`}
                          onClick={() => setSelected(parcel)}
                        >
                          {next === 'delivered' ? <CheckCircle size={16} /> : <Truck size={16} />}
                          {STATUS_LABELS[parcel.status] ?? 'Update'}
                        </button>
                      )}
                      {parcel.status === 'out_for_delivery' && (
                        <a href="/courier/proof" className="btn btn-secondary btn-sm">
                          Add Proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Confirm Status Update"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => selected && nextStatus(selected.status) && updateStatus(selected.id, nextStatus(selected.status)!)}
            >
              <ArrowRight size={16} /> Confirm Update
            </button>
          </>
        }
      >
        {selected && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Update status for <strong style={{ color: 'var(--text-primary)' }}>{selected.trackingNumber}</strong>?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
              <StatusBadge status={selected.status} />
              <ArrowRight size={16} color="var(--text-muted)" />
              {nextStatus(selected.status) && <StatusBadge status={nextStatus(selected.status)!} />}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AssignedDeliveries;
