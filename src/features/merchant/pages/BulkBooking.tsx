import React, { useState } from 'react';
import { Plus, Trash2, Upload, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast } from '../../../components/shared/SharedComponents';
import type { ParcelSize } from '../../../types/global.types';
import { merchantApi } from '../api/merchant.api';

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

const DISTRICTS = ['Colombo','Gampaha','Kalutara','Kandy','Galle','Matara','Jaffna','Kurunegala'];

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

    const ordersToCreate = rows.map((row, idx) => ({
      merchantOrderRef: `BULK-${Date.now()}-${idx + 1}`,
      recipient: {
        name: row.recipientName,
        phone: row.recipientPhone,
      },
      pickupAddress: {
        street: 'Main Warehouse',
        city: 'Colombo',
        district: 'Colombo',
      },
      deliveryAddress: {
        street: row.deliveryAddress,
        city: row.district,
        district: row.district,
      },
      description: row.description || 'Bulk order package',
      weightKg: Number(row.weight) || 1,
      size: (row.size ? row.size.toUpperCase() : 'STANDARD') as any,
      fragile: false,
      paymentMethod: (row.paymentMethod ? row.paymentMethod.toUpperCase() : 'COD') as any,
    }));

    try {
      const res = await merchantApi.createBulkOrders(ordersToCreate);
      setSubmitting(false);
      setSubmitted(true);
      const successCount = res?.successCount ?? ordersToCreate.length;
      showToast(`${successCount} parcel(s) booked successfully!`, 'success');
    } catch (err: any) {
      setSubmitting(false);
      showToast(err?.response?.data?.message || err?.message || 'Failed to submit bulk booking', 'error');
    }
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
            <a href="/merchant/orders" className="btn btn-primary">View Shipments</a>
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
