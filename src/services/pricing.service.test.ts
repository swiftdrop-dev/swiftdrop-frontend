import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  pricingService,
  mapDistrictToZoneCode,
  mapDistrictToZoneId,
} from './pricing.service';

describe('Pricing Service and District Mapper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('mapDistrictToZoneCode', () => {
    it('maps Colombo to Western Province Metro zone', () => {
      expect(mapDistrictToZoneCode('Colombo')).toBe('ZONE_WP_COLOMBO');
      expect(mapDistrictToZoneCode('colombo')).toBe('ZONE_WP_COLOMBO');
    });

    it('maps Gampaha and Kalutara to Western Suburb zone', () => {
      expect(mapDistrictToZoneCode('Gampaha')).toBe('ZONE_WP_SUBURB');
      expect(mapDistrictToZoneCode('Kalutara')).toBe('ZONE_WP_SUBURB');
    });

    it('maps Kandy, Matale, Nuwara Eliya to Central zone', () => {
      expect(mapDistrictToZoneCode('Kandy')).toBe('ZONE_CP_KANDY');
      expect(mapDistrictToZoneCode('Matale')).toBe('ZONE_CP_KANDY');
      expect(mapDistrictToZoneCode('Nuwara Eliya')).toBe('ZONE_CP_KANDY');
    });

    it('maps Galle, Matara, Hambantota to Southern zone', () => {
      expect(mapDistrictToZoneCode('Galle')).toBe('ZONE_SP_GALLE');
      expect(mapDistrictToZoneCode('Matara')).toBe('ZONE_SP_GALLE');
      expect(mapDistrictToZoneCode('Hambantota')).toBe('ZONE_SP_GALLE');
    });

    it('falls back safely for empty input', () => {
      expect(mapDistrictToZoneCode('')).toBe('ZONE_WP_COLOMBO');
    });
  });

  describe('mapDistrictToZoneId', () => {
    it('returns zone ID from loaded zone list', () => {
      const mockZones = [
        { id: 10, name: 'Colombo Metro', code: 'ZONE_WP_COLOMBO', isActive: true },
        { id: 20, name: 'Kandy Central', code: 'ZONE_CP_KANDY', isActive: true },
      ];
      expect(mapDistrictToZoneId('Colombo', mockZones)).toBe(10);
      expect(mapDistrictToZoneId('Kandy', mockZones)).toBe(20);
    });

    it('returns standard seed fallback IDs when zone list is empty', () => {
      expect(mapDistrictToZoneId('Colombo')).toBe(1);
      expect(mapDistrictToZoneId('Gampaha')).toBe(2);
      expect(mapDistrictToZoneId('Kandy')).toBe(3);
      expect(mapDistrictToZoneId('Galle')).toBe(4);
    });
  });

  describe('pricingService API client', () => {
    it('fetches fee estimate successfully', async () => {
      const mockResponse = {
        fromZoneName: 'Western Province (Colombo)',
        toZoneName: 'Central Province (Kandy)',
        baseFee: 500.0,
        perKgFee: 80.0,
        weightKg: 2.0,
        deliveryType: 'STANDARD',
        strategyApplied: 'Standard Door-to-Door Delivery',
        totalEstimatedFee: 660.0,
        estimatedDeliveryDays: 2,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const estimate = await pricingService.estimateFee({
        fromZoneCode: 'ZONE_WP_COLOMBO',
        toZoneCode: 'ZONE_CP_KANDY',
        weightKg: 2.0,
        deliveryType: 'STANDARD',
      });

      expect(estimate.totalEstimatedFee).toBe(660.0);
      expect(estimate.strategyApplied).toBe('Standard Door-to-Door Delivery');
    });

    it('attaches Bearer token from localStorage to pricing requests', async () => {
      localStorage.setItem('swiftdrop_token', 'test-token-jwt');

      let capturedHeaders: HeadersInit | undefined;
      vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async (_url, init) => {
        capturedHeaders = init?.headers;
        return {
          ok: true,
          status: 200,
          json: async () => [],
        } as Response;
      });

      await pricingService.getActiveZones();

      expect(capturedHeaders).toBeDefined();
      const headers = new Headers(capturedHeaders);
      expect(headers.get('Authorization')).toBe('Bearer test-token-jwt');
    });
  });
});
