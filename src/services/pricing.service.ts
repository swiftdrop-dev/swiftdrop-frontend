import { API_BASE_URL } from '../utils/constants';

export interface Zone {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface ZoneRate {
  id?: number;
  fromZoneId: number;
  fromZoneName?: string;
  toZoneId: number;
  toZoneName?: string;
  baseFee: number;
  perKgFee: number;
  expressMultiplier: number;
  estimatedDeliveryDays: number;
}

export interface FeeEstimateRequest {
  fromZoneId?: number;
  toZoneId?: number;
  fromZoneCode?: string;
  toZoneCode?: string;
  weightKg: number;
  deliveryType: string;
}

export interface FeeEstimateResponse {
  fromZoneName: string;
  toZoneName: string;
  baseFee: number;
  perKgFee: number;
  weightKg: number;
  deliveryType: string;
  strategyApplied: string;
  totalEstimatedFee: number;
  estimatedDeliveryDays: number;
}

// Helper to try API Gateway (8080) first, or direct pricing-service (8083) if gateway is offline
async function fetchPricing(path: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    if (res.ok || res.status < 500) return res;
    throw new Error('Gateway returned 5xx');
  } catch {
    return await fetch(`http://localhost:8083/api/v1${path}`, options);
  }
}

export const pricingService = {
  async getActiveZones(): Promise<Zone[]> {
    try {
      const response = await fetchPricing('/zones');
      if (!response.ok) throw new Error('Failed to fetch zones');
      return await response.json();
    } catch (e) {
      console.warn('Using fallback zones:', e);
      return [
        { id: 1, name: 'Western Province (Colombo)', code: 'ZONE_WP_COLOMBO', isActive: true },
        { id: 2, name: 'Western Province (Gampaha/Kalutara)', code: 'ZONE_WP_SUBURB', isActive: true },
        { id: 3, name: 'Central Province (Kandy)', code: 'ZONE_CP_KANDY', isActive: true },
        { id: 4, name: 'Southern Province (Galle)', code: 'ZONE_SP_GALLE', isActive: true },
      ];
    }
  },

  async estimateFee(req: FeeEstimateRequest): Promise<FeeEstimateResponse> {
    const response = await fetchPricing('/pricing/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error estimating delivery fee');
    }
    return await response.json();
  },

  async downloadReceiptPdf(trackingNumber: string): Promise<void> {
    const response = await fetchPricing(`/receipts/${trackingNumber}`);
    if (!response.ok) {
      throw new Error('Failed to generate PDF receipt');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${trackingNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getAllZonesAdmin(): Promise<Zone[]> {
    const response = await fetchPricing('/zones/admin/all');
    return await response.json();
  },

  async createZoneAdmin(zone: { name: string; code: string }): Promise<Zone> {
    const response = await fetchPricing('/zones/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zone),
    });
    return await response.json();
  },

  async getAllRatesAdmin(): Promise<ZoneRate[]> {
    const response = await fetchPricing('/zones/admin/rates');
    return await response.json();
  },

  async saveRateAdmin(rate: ZoneRate): Promise<ZoneRate> {
    const response = await fetchPricing('/zones/admin/rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rate),
    });
    return await response.json();
  },
};
