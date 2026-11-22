import React, { useState, useEffect } from 'react';
import { Calculator, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { pricingService, type Zone, type FeeEstimateResponse } from '../../../services/pricing.service';

interface FeeEstimateWidgetProps {
  initialFromZoneId?: number;
  initialToZoneId?: number;
  initialWeight?: number;
  onFeeCalculated?: (fee: number) => void;
}

export const FeeEstimateWidget: React.FC<FeeEstimateWidgetProps> = ({
  initialFromZoneId,
  initialToZoneId,
  initialWeight = 1.0,
  onFeeCalculated,
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [fromZoneId, setFromZoneId] = useState<number | string>(initialFromZoneId || '');
  const [toZoneId, setToZoneId] = useState<number | string>(initialToZoneId || '');
  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [deliveryType, setDeliveryType] = useState<string>('STANDARD');

  const [estimate, setEstimate] = useState<FeeEstimateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pricingService.getActiveZones().then((data) => {
      setZones(data);
      if (data.length >= 2 && !fromZoneId && !toZoneId) {
        setFromZoneId(data[0].id);
        setToZoneId(data[1].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!fromZoneId || !toZoneId || !weightKg || weightKg <= 0) {
      setEstimate(null);
      return;
    }

    const timer = setTimeout(() => {
      calculateEstimate();
    }, 300);

    return () => clearTimeout(timer);
  }, [fromZoneId, toZoneId, weightKg, deliveryType]);

  const calculateEstimate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await pricingService.estimateFee({
        fromZoneId: Number(fromZoneId),
        toZoneId: Number(toZoneId),
        weightKg: Number(weightKg),
        deliveryType,
      });

      setEstimate(result);
      if (onFeeCalculated) {
        onFeeCalculated(result.totalEstimatedFee);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to pricing service');
      setEstimate(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={18} color="var(--primary)" /> Shipping Fee Calculator
        </h3>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--primary-dark)',
            background: 'var(--primary-tint)',
            border: '1px solid var(--border-accent)',
            padding: '3px 10px',
            borderRadius: 12,
          }}
        >
          Strategy Pattern
        </span>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="fee-from-zone">
              Pickup Zone (Origin)
            </label>
            <select
              id="fee-from-zone"
              value={fromZoneId}
              onChange={(e) => setFromZoneId(e.target.value)}
              className="form-input"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="fee-to-zone">
              Drop-off Zone (Destination)
            </label>
            <select
              id="fee-to-zone"
              value={toZoneId}
              onChange={(e) => setToZoneId(e.target.value)}
              className="form-input"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="fee-weight">
              Parcel Weight (KG)
            </label>
            <input
              id="fee-weight"
              type="number"
              min="0.1"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="fee-delivery-type">
              Delivery Speed
            </label>
            <select
              id="fee-delivery-type"
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              className="form-input"
            >
              <option value="STANDARD">Standard Delivery</option>
              <option value="EXPRESS">Express Priority (1.5x)</option>
              <option value="BULK">Heavy Cargo & Bulk (&gt;10kg)</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={14} className="animate-spin" color="var(--primary)" />
            <span>Calculating latest zone rate...</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {estimate && !loading && (
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Total Estimated Fee
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'monospace' }}>
                LKR {estimate.totalEstimatedFee.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Base Charge:</strong> LKR {estimate.baseFee.toFixed(2)}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Per-Kg Rate:</strong> LKR {estimate.perKgFee.toFixed(2)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} color="var(--text-muted)" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Transit:</strong> {estimate.estimatedDeliveryDays} business days</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Strategy:</strong> {estimate.strategyApplied}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeEstimateWidget;
