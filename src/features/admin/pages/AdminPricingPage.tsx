import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  DollarSign,
  RefreshCw,
  Server,
  Edit2,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast, Modal } from '../../../components/shared/SharedComponents';
import { pricingService, type Zone, type ZoneRate } from '../../../services/pricing.service';

export const AdminPricingPage: React.FC = () => {
  const { showToast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]);
  const [rates, setRates] = useState<ZoneRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmittingZone, setIsSubmittingZone] = useState<boolean>(false);
  const [isSavingRate, setIsSavingRate] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCode, setNewZoneCode] = useState('');
  const [editingRate, setEditingRate] = useState<ZoneRate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zonesData, ratesData] = await Promise.all([
        pricingService.getAllZonesAdmin().catch((err) => {
          console.warn('Failed to load zones from API, using active zones fallback', err);
          return pricingService.getActiveZones();
        }),
        pricingService.getAllRatesAdmin().catch((err) => {
          console.warn('Failed to load rates from API', err);
          return [];
        }),
      ]);
      setZones(zonesData || []);
      setRates(ratesData || []);
    } catch (err: any) {
      console.error('Error loading pricing data:', err);
      showToast('Error loading zones and pricing rates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneCode.trim()) {
      showToast('Please enter both zone name and zone code', 'warning');
      return;
    }

    setIsSubmittingZone(true);
    try {
      await pricingService.createZoneAdmin({
        name: newZoneName.trim(),
        code: newZoneCode.trim().toUpperCase(),
      });
      showToast(`Zone "${newZoneName}" created successfully!`, 'success');
      setNewZoneName('');
      setNewZoneCode('');
      loadData();
    } catch (err: any) {
      showToast('Error creating zone: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmittingZone(false);
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    setIsSavingRate(true);
    try {
      await pricingService.saveRateAdmin(editingRate);
      showToast('Pricing rate updated successfully!', 'success');
      setEditingRate(null);
      loadData();
    } catch (err: any) {
      showToast('Error saving rate: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSavingRate(false);
    }
  };

  return (
    <DashboardLayout title="Zone & Pricing Management">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 className="page-title">Zone & Pricing Management</h1>
          <p className="page-subtitle">
            Configure geographic delivery coverage zones, base tariffs, and route-specific rates
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--primary-tint)',
              color: 'var(--primary-dark)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <Server size={13} /> pricing-service :8083
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Grid: Add Zone & Active Zones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Create Zone Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Plus size={18} color="var(--primary)" /> Add New Delivery Zone
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateZone}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-zone-name">
                  Zone Name
                </label>
                <input
                  id="new-zone-name"
                  type="text"
                  placeholder="e.g. Northern Province (Jaffna)"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-zone-code">
                  Zone Code
                </label>
                <input
                  id="new-zone-code"
                  type="text"
                  placeholder="e.g. ZONE_NP_JAF"
                  value={newZoneCode}
                  onChange={(e) => setNewZoneCode(e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingZone}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                {isSubmittingZone ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Adding Zone...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add Zone
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Active Zones List Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Layers size={18} color="var(--primary)" /> Active Coverage Zones
            </h3>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'var(--bg-overlay)',
                padding: '4px 10px',
                borderRadius: 12,
              }}
            >
              {zones.length} {zones.length === 1 ? 'Zone' : 'Zones'}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Zone Name</th>
                  <th>Code</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && zones.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                      <p style={{ fontSize: 13 }}>Loading delivery zones...</p>
                    </td>
                  </tr>
                ) : zones.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                      No coverage zones configured yet.
                    </td>
                  </tr>
                ) : (
                  zones.map((z) => (
                    <tr key={z.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                        #{z.id}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={14} color="var(--primary)" />
                          {z.name}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            padding: '3px 8px',
                            background: 'var(--bg-overlay)',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                          }}
                        >
                          {z.code}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${z.isActive ? 'badge-delivered' : 'badge-failed'}`}>
                          <CheckCircle size={10} />
                          {z.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing Matrix Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">
              <DollarSign size={18} color="var(--primary)" /> Zone-to-Zone Pricing Matrix
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 26px' }}>
              Base delivery tariff and per-kilogram increment rates between dispatch and destination zones
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--bg-overlay)',
              padding: '4px 10px',
              borderRadius: 12,
            }}
          >
            {rates.length} {rates.length === 1 ? 'Route' : 'Routes'}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>From Zone</th>
                <th>To Zone</th>
                <th>Base Fee</th>
                <th>Per Kg</th>
                <th>Express Mult</th>
                <th>Est. Delivery</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && rates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <p style={{ fontSize: 13 }}>Loading pricing matrix...</p>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                    No rate entries found for configured zones.
                  </td>
                </tr>
              ) : (
                rates.map((r, i) => (
                  <tr key={r.id ?? `${r.fromZoneId}-${r.toZoneId}-${i}`}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.fromZoneName}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowRight size={13} color="var(--text-muted)" />
                        {r.toZoneName}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-dark)' }}>
                      LKR {Number(r.baseFee || 0).toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      LKR {Number(r.perKgFee || 0).toFixed(2)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(14, 165, 233, 0.1)',
                          color: '#0284c7',
                        }}
                      >
                        {r.expressMultiplier}x
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        {r.estimatedDeliveryDays} {r.estimatedDeliveryDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingRate(r)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Modal */}
      {editingRate && (
        <Modal
          isOpen={!!editingRate}
          onClose={() => setEditingRate(null)}
          title="Edit Route Pricing Rate"
          size="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingRate(null)}
                disabled={isSavingRate}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-rate-form"
                className="btn btn-primary"
                disabled={isSavingRate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {isSavingRate ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          }
        >
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--bg-overlay)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <MapPin size={16} color="var(--primary)" />
            <span>{editingRate.fromZoneName}</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span>{editingRate.toZoneName}</span>
          </div>

          <form id="edit-rate-form" onSubmit={handleSaveRate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-base-fee">
                  Base Fee (LKR)
                </label>
                <input
                  id="edit-base-fee"
                  type="number"
                  step="5"
                  value={editingRate.baseFee}
                  onChange={(e) =>
                    setEditingRate({ ...editingRate, baseFee: parseFloat(e.target.value) || 0 })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-per-kg-fee">
                  Per-Kg Fee (LKR)
                </label>
                <input
                  id="edit-per-kg-fee"
                  type="number"
                  step="5"
                  value={editingRate.perKgFee}
                  onChange={(e) =>
                    setEditingRate({ ...editingRate, perKgFee: parseFloat(e.target.value) || 0 })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-express-mult">
                  Express Multiplier
                </label>
                <input
                  id="edit-express-mult"
                  type="number"
                  step="0.1"
                  min="1"
                  value={editingRate.expressMultiplier}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      expressMultiplier: parseFloat(e.target.value) || 1.0,
                    })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-est-days">
                  Estimated Delivery Days
                </label>
                <input
                  id="edit-est-days"
                  type="number"
                  min="1"
                  value={editingRate.estimatedDeliveryDays}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      estimatedDeliveryDays: parseInt(e.target.value) || 1,
                    })
                  }
                  className="form-input"
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminPricingPage;
