import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, Phone, Weight, Info, ChevronRight, ChevronLeft, CheckCircle, Mail, Briefcase, Archive, Boxes } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast } from '../../../components/shared/SharedComponents';
import { MOCK_PARCELS } from '../../../lib/mockData';
import type { ParcelSize } from '../../../types/global.types';

const SIZES: { value: ParcelSize; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'xs', label: 'Extra Small', desc: 'Under 0.5 kg / Envelope', icon: <Mail size={20} strokeWidth={1.6} /> },
  { value: 'sm', label: 'Small', desc: '0.5–2 kg / Shoebox', icon: <Package size={20} strokeWidth={1.6} /> },
  { value: 'md', label: 'Medium', desc: '2–5 kg / Laptop bag', icon: <Briefcase size={20} strokeWidth={1.6} /> },
  { value: 'lg', label: 'Large', desc: '5–15 kg / Moving box', icon: <Archive size={20} strokeWidth={1.6} /> },
  { value: 'xl', label: 'Extra Large', desc: '15 kg+ / Bulk cargo', icon: <Boxes size={20} strokeWidth={1.6} /> },
];

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambanthota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle',
];

function calcFee(weight: number, size: ParcelSize, fragile: boolean, toDistrict: string): {
  base: number; weight: number; distance: number; fragile: number; total: number; days: number;
} {
  const baseMap: Record<ParcelSize, number> = { xs: 150, sm: 250, md: 350, lg: 550, xl: 850 };
  const base = baseMap[size];
  const wFee = Math.ceil(weight) * 50;
  const farDistricts = ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Hambanthota', 'Batticaloa', 'Trincomalee', 'Ampara'];
  const distFee = farDistricts.includes(toDistrict) ? 300 : toDistrict === 'Colombo' ? 0 : 100;
  const fragFee = fragile ? 75 : 0;
  const days = farDistricts.includes(toDistrict) ? 3 : toDistrict === 'Colombo' ? 1 : 2;
  return { base, weight: wFee, distance: distFee, fragile: fragFee, total: base + wFee + distFee + fragFee, days };
}

const BookParcel: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    recipientName: '', recipientPhone: '',
    pickupStreet: '', pickupCity: 'Colombo', pickupDistrict: 'Colombo',
    deliveryStreet: '', deliveryCity: '', deliveryDistrict: 'Colombo',
    description: '', weight: 1, size: 'sm' as ParcelSize,
    declaredValue: '', fragile: false, specialInstructions: '',
    paymentMethod: 'cod' as 'cod' | 'online',
  });

  const fee = calcFee(form.weight, form.size, form.fragile, form.deliveryDistrict);

  const update = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    const newParcel = {
      id: `prc_${Date.now()}`,
      trackingNumber: `SWF-2024-${String(100000 + MOCK_PARCELS.length + 1).slice(1)}`,
      status: 'pending' as const,
      senderId: 'usr_001', senderName: 'Amal Perera', senderPhone: '077-1234567', senderType: 'customer' as const,
      recipientName: form.recipientName, recipientPhone: form.recipientPhone,
      recipientAddress: { street: form.deliveryStreet, city: form.deliveryCity, district: form.deliveryDistrict },
      pickupAddress: { street: form.pickupStreet, city: form.pickupCity, district: form.pickupDistrict },
      description: form.description, weight: form.weight, size: form.size,
      declaredValue: form.declaredValue ? Number(form.declaredValue) : undefined,
      fragile: form.fragile, specialInstructions: form.specialInstructions,
      deliveryFee: fee.total, totalFee: fee.total,
      paymentStatus: 'pending' as const, paymentMethod: form.paymentMethod,
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + fee.days * 86400000).toISOString().slice(0, 10),
      statusHistory: [{ status: 'pending' as const, timestamp: new Date().toISOString(), note: 'Booking confirmed' }],
    };

    MOCK_PARCELS.unshift(newParcel as any);
    setSubmitting(false);
    showToast('Parcel booked successfully! ' + newParcel.trackingNumber, 'success');
    navigate('/customer/parcels');
  };

  const steps = [
    { id: 1, label: 'Addresses' },
    { id: 2, label: 'Package' },
    { id: 3, label: 'Review' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Book a Parcel</h1>
        <p className="page-subtitle">Fill in the details to create a new delivery booking</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator" style={{ maxWidth: 480, marginBottom: 28 }}>
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="step-item">
              <div className={`step-circle ${step > s.id ? 'done' : step === s.id ? 'active' : ''}`}>
                {step > s.id ? <CheckCircle size={14} /> : s.id}
              </div>
              <span className={`step-label ${step > s.id ? 'done' : step === s.id ? 'active' : ''}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-line ${step > s.id ? 'done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <div className="card-body">
            {/* ── STEP 1: Addresses ── */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                  Pickup & Delivery Addresses
                </h3>

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, borderLeft: '3px solid var(--primary)', paddingLeft: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 12 }}>Pickup Location</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Street Address</label>
                        <input className="form-input" placeholder="12 Kandy Road" value={form.pickupStreet}
                          onChange={e => update('pickupStreet', e.target.value)} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">City</label>
                          <input className="form-input" placeholder="Colombo" value={form.pickupCity}
                            onChange={e => update('pickupCity', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">District</label>
                          <select className="form-input" value={form.pickupDistrict}
                            onChange={e => update('pickupDistrict', e.target.value)}>
                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 12 }}>Delivery Details</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Recipient Name *</label>
                        <div className="form-input-icon">
                          <User className="icon" size={16} />
                          <input className="form-input" placeholder="Full name" value={form.recipientName}
                            onChange={e => update('recipientName', e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Recipient Phone *</label>
                        <div className="form-input-icon">
                          <Phone className="icon" size={16} />
                          <input className="form-input" placeholder="077-XXXXXXX" value={form.recipientPhone}
                            onChange={e => update('recipientPhone', e.target.value)} required />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Delivery Street Address *</label>
                      <input className="form-input" placeholder="45 Galle Road" value={form.deliveryStreet}
                        onChange={e => update('deliveryStreet', e.target.value)} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" placeholder="Colombo" value={form.deliveryCity}
                          onChange={e => update('deliveryCity', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <select className="form-input" value={form.deliveryDistrict}
                          onChange={e => update('deliveryDistrict', e.target.value)}>
                          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Package Details ── */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                  Package Details
                </h3>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Package Description *</label>
                  <div className="form-input-icon">
                    <Package className="icon" size={16} />
                    <input className="form-input" placeholder="e.g. Electronics – Laptop" value={form.description}
                      onChange={e => update('description', e.target.value)} required />
                  </div>
                </div>

                {/* Size Selector */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Package Size *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {SIZES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => update('size', s.value)}
                        style={{
                          padding: '12px 8px', borderRadius: 14, textAlign: 'center',
                          border: `2px solid ${form.size === s.value ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: form.size === s.value ? 'var(--primary-tint)' : 'var(--bg-overlay)',
                          cursor: 'pointer', transition: 'all 200ms', fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: form.size === s.value ? 'var(--primary-light)' : 'var(--text-secondary)', marginTop: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <div className="form-input-icon">
                      <Weight className="icon" size={16} />
                      <input type="number" min={0.1} step={0.1} className="form-input"
                        value={form.weight} onChange={e => update('weight', Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Declared Value (Rs.)</label>
                    <input type="number" min={0} className="form-input"
                      placeholder="Optional" value={form.declaredValue}
                      onChange={e => update('declaredValue', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-input" value={form.paymentMethod}
                      onChange={e => update('paymentMethod', e.target.value)}>
                      <option value="cod">Cash on Delivery</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fragile Package?</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 8 }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={form.fragile} onChange={e => update('fragile', e.target.checked)} />
                        <span className="toggle-track" />
                      </label>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        {form.fragile ? 'Requires careful handling' : 'Standard handling'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions</label>
                  <textarea className="form-input" placeholder="e.g. Call before delivery, leave at gate..."
                    value={form.specialInstructions} onChange={e => update('specialInstructions', e.target.value)} />
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                  Review & Confirm
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Address summary */}
                  <div style={{ background: 'var(--bg-overlay)', borderRadius: 14, padding: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Addresses</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>PICKUP FROM</p>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{form.pickupStreet}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{form.pickupCity}, {form.pickupDistrict}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>DELIVER TO</p>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{form.recipientName}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{form.deliveryStreet}, {form.deliveryCity}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{form.deliveryDistrict}</p>
                        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{form.recipientPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Package summary */}
                  <div style={{ background: 'var(--bg-overlay)', borderRadius: 14, padding: 16, fontSize: 13 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>Package</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div><p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Description</p><p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.description}</p></div>
                      <div><p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Size / Weight</p><p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.size.toUpperCase()} / {form.weight}kg</p></div>
                      <div><p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Payment</p><p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p></div>
                    </div>
                    {form.fragile && <p style={{ marginTop: 10, color: 'var(--warning)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Info size={12} /> Fragile — handled with care (+Rs. 75)</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
              {step > 1 ? (
                <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                  <ChevronLeft size={16} /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Booking…</>
                  ) : (
                    <><CheckCircle size={16} /> Confirm Booking</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fee Estimate Sidebar */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div className="fee-box">
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16 }}>
              Fee Estimate
            </p>
            <div className="fee-row">
              <span>Base rate ({form.size.toUpperCase()})</span>
              <span>Rs. {fee.base}</span>
            </div>
            <div className="fee-row">
              <span>Weight ({form.weight}kg)</span>
              <span>Rs. {fee.weight}</span>
            </div>
            <div className="fee-row">
              <span>Distance ({form.deliveryDistrict})</span>
              <span>Rs. {fee.distance}</span>
            </div>
            {form.fragile && (
              <div className="fee-row">
                <span>Fragile handling</span>
                <span>Rs. {fee.fragile}</span>
              </div>
            )}
            <div className="fee-row-total">
              <span>Total Fee</span>
              <span>Rs. {fee.total.toLocaleString()}</span>
            </div>

            <div style={{
              marginTop: 16, padding: '10px 14px', background: 'var(--success-bg)',
              border: '1px solid var(--success-border)', borderRadius: 10,
              fontSize: 13, color: 'var(--success)', fontWeight: 500,
            }}>
              Est. delivery in <strong>{fee.days} {fee.days === 1 ? 'day' : 'days'}</strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookParcel;
