import React, { useState } from 'react';
import { Camera, PenLine, CheckCircle, Upload } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatusBadge, useToast } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';

const ProofOfDelivery: React.FC = () => {
  const { showToast } = useToast();
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [notes, setNotes] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eligibleParcels = MOCK_PARCELS.filter(
    p => p.courierId === 'cou_001' && ['in_transit', 'out_for_delivery', 'assigned', 'picked_up'].includes(p.status)
  );

  const selectedParcel = MOCK_PARCELS.find(p => p.id === selectedParcelId);

  const handleSubmit = async () => {
    if (!selectedParcelId) { showToast('Please select a parcel first.', 'error'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    // Update parcel status to delivered
    const idx = MOCK_PARCELS.findIndex(p => p.id === selectedParcelId);
    if (idx !== -1) {
      MOCK_PARCELS[idx] = {
        ...MOCK_PARCELS[idx],
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        statusHistory: [
          ...MOCK_PARCELS[idx].statusHistory,
          { status: 'delivered', timestamp: new Date().toISOString(), note: notes || 'Delivered with proof of delivery' },
        ],
      } as any;
    }

    setSubmitting(false);
    setSubmitted(true);
    showToast('Proof of delivery submitted!', 'success');
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--success-bg)', border: '3px solid var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'scaleIn 0.3s ease',
          }}>
            <CheckCircle size={36} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Proof Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            Delivery for <strong>{selectedParcel?.trackingNumber}</strong> has been marked as delivered.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => {
              setSubmitted(false); setSelectedParcelId(''); setPhotoAdded(false); setSignatureDrawn(false); setNotes('');
            }}>
              New Submission
            </button>
            <a href="/courier/deliveries" className="btn btn-primary">Back to Deliveries</a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Proof of Delivery</h1>
        <p className="page-subtitle">Upload delivery evidence and confirm delivery completion</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        {/* Parcel Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Select Parcel</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Active Deliveries</label>
                <select className="form-input" value={selectedParcelId}
                  onChange={e => setSelectedParcelId(e.target.value)}>
                  <option value="">-- Choose a parcel --</option>
                  {eligibleParcels.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.trackingNumber} — {p.recipientName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedParcel && (
                <div style={{
                  marginTop: 16, padding: 14, background: 'var(--bg-overlay)',
                  borderRadius: 14, fontSize: 13,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <StatusBadge status={selectedParcel.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recipient</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedParcel.recipientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Address</span>
                    <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {selectedParcel.recipientAddress.street}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                    <span style={{ fontWeight: 700, color: selectedParcel.paymentMethod === 'cod' ? 'var(--warning)' : 'var(--success)' }}>
                      {selectedParcel.paymentMethod === 'cod' ? `Rs. ${selectedParcel.totalFee} COD` : 'Online — Paid'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header"><span className="card-title">Delivery Notes</span></div>
            <div className="card-body">
              <textarea
                className="form-input"
                style={{ minHeight: 90 }}
                placeholder="e.g. Left with security guard, called recipient before delivery..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Evidence Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Photo */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Delivery Photo</span>
              {photoAdded && <CheckCircle size={16} color="var(--success)" />}
            </div>
            <div className="card-body">
              {photoAdded ? (
                <div style={{
                  borderRadius: 14, overflow: 'hidden', border: '2px solid var(--success)',
                  height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--success-bg)', gap: 8, color: 'var(--success)', fontWeight: 600,
                }}>
                  <CheckCircle size={24} /> Photo captured
                </div>
              ) : (
                <div
                  className="drop-zone"
                  onClick={() => setPhotoAdded(true)}
                >
                  <Camera size={32} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload photo</p>
                  <p style={{ fontSize: 12 }}>Show parcel at doorstep or with recipient</p>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recipient Signature</span>
              {signatureDrawn && <CheckCircle size={16} color="var(--success)" />}
            </div>
            <div className="card-body">
              {signatureDrawn ? (
                <div style={{
                  height: 120, borderRadius: 14, border: '2px solid var(--success)',
                  background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, color: 'var(--success)', fontWeight: 600,
                }}>
                  <CheckCircle size={20} /> Signature captured
                </div>
              ) : (
                <div
                  className="drop-zone"
                  style={{ height: 120 }}
                  onClick={() => setSignatureDrawn(true)}
                >
                  <PenLine size={28} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Tap for signature pad</p>
                  <p style={{ fontSize: 12 }}>Recipient signs on device</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            className="btn btn-success btn-lg"
            onClick={handleSubmit}
            disabled={submitting || !selectedParcelId}
            style={{ width: '100%' }}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</>
            ) : (
              <><Upload size={18} /> Submit Proof of Delivery</>
            )}
          </button>

          {!photoAdded && !signatureDrawn && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Add at least one evidence item before submitting
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProofOfDelivery;
