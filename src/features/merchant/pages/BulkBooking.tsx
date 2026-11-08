import React, { useState } from 'react';
import { Plus, Trash2, Upload, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast } from '../../../components/shared/SharedComponents';
import type { ParcelSize } from '../../../types/global.types';
import { MOCK_PARCELS } from '../../../lib/mockData';

interface BulkRow {
  id: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  district: string;
  description: string;
  weight: number;
  size: ParcelSize;
  paymentMethod: 'cod' | 'online';
}

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Galle','Matara','Jaffna','Kandy','Kurunegala'];

const emptyRow = (): BulkRow => ({
  id: crypto.randomUUID(), recipientName: '', recipientPhone: '',
  deliveryAddress: '', district: 'Colombo', description: '',
  weight: 1, size: 'sm', paymentMethod: 'cod',
});

const BulkBooking: React.FC = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<BulkRow[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addRow = () => setRows(r => [...r, emptyRow()]);
  const removeRow = (id: string) => setRows(r => r.filter(row => row.id !== id));
  const updateRow = (id: string, key: keyof BulkRow, value: string | number) => {
    setRows(r => r.map(row => row.id === id ? { ...row, [key]: value } : row));
  };

  const handleSubmit = async () => {
    const valid = rows.every(r => r.recipientName && r.recipientPhone && r.deliveryAddress);
    if (!valid) { showToast('Please fill all required fields.', 'error'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    rows.forEach(row => {
      MOCK_PARCELS.unshift({
        id: `prc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        trackingNumber: `SWF-2024-${String(200000 + MOCK_PARCELS.length + 1).slice(1)}`,
        status: 'pending', senderId: 'usr_002', senderName: 'Lanka Traders',
        senderPhone: '011-5678900', senderType: 'merchant',
        recipientName: row.recipientName, recipientPhone: row.recipientPhone,
        recipientAddress: { street: row.deliveryAddress, city: row.district, district: row.district },
        pickupAddress: { street: '78 Industrial Zone', city: 'Colombo', district: 'Colombo' },
        description: row.description, weight: row.weight, size: row.size, fragile: false,
        deliveryFee: 350, totalFee: 350, paymentStatus: 'pending',
        paymentMethod: row.paymentMethod, createdAt: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Bulk booking import' }],
      } as any);
    });

    setSubmitting(false);
    setSubmitted(true);
    showToast(`${rows.length} parcel(s) booked successfully!`, 'success');
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-bg)', border: '3px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn 0.3s ease' }}>
            <CheckCircle size={36} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Bulk Booking Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 400 }}>
            {rows.length} parcels have been created and are awaiting courier assignment.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => { setRows([emptyRow()]); setSubmitted(false); }}>
              New Bulk Booking
            </button>
            <a href="/merchant/parcels" className="btn btn-primary">View Shipments</a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Bulk Booking</h1>
          <p className="page-subtitle">Create multiple shipment bookings at once</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm">
            <Upload size={14} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</> : `Submit ${rows.length} Parcel${rows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="table-wrapper">
          <table className="table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Recipient Name *</th>
                <th>Phone *</th>
                <th>Delivery Address *</th>
                <th>District</th>
                <th>Item Description</th>
                <th style={{ width: 90 }}>Weight</th>
                <th style={{ width: 90 }}>Size</th>
                <th style={{ width: 110 }}>Payment</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{idx + 1}</td>
                  <td>
                    <input className="form-input" style={{ minWidth: 150 }} placeholder="Amal Perera"
                      value={row.recipientName} onChange={e => updateRow(row.id, 'recipientName', e.target.value)} />
                  </td>
                  <td>
                    <input className="form-input" style={{ minWidth: 120 }} placeholder="077-XXXXXXX"
                      value={row.recipientPhone} onChange={e => updateRow(row.id, 'recipientPhone', e.target.value)} />
                  </td>
                  <td>
                    <input className="form-input" style={{ minWidth: 180 }} placeholder="12 Main Street"
                      value={row.deliveryAddress} onChange={e => updateRow(row.id, 'deliveryAddress', e.target.value)} />
                  </td>
                  <td>
                    <select className="form-input" value={row.district} onChange={e => updateRow(row.id, 'district', e.target.value)}>
                      {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </td>
                  <td>
                    <input className="form-input" placeholder="Description..." value={row.description}
                      onChange={e => updateRow(row.id, 'description', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min={0.1} step={0.1} className="form-input" value={row.weight}
                      onChange={e => updateRow(row.id, 'weight', Number(e.target.value))} />
                  </td>
                  <td>
                    <select className="form-input" value={row.size} onChange={e => updateRow(row.id, 'size', e.target.value as ParcelSize)}>
                      {(['xs','sm','md','lg','xl'] as ParcelSize[]).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-input" value={row.paymentMethod} onChange={e => updateRow(row.id, 'paymentMethod', e.target.value)}>
                      <option value="cod">COD</option>
                      <option value="online">Online</option>
                    </select>
                  </td>
                  <td>
                    {rows.length > 1 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => removeRow(row.id)}
                        style={{ color: 'var(--danger)', padding: 6 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={addRow}>
            <Plus size={14} /> Add Row
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkBooking;
