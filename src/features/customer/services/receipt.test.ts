import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadReceipt } from './receipt';
import { pricingService } from '../../../services/pricing.service';
import type { Parcel } from '../../../types/global.types';

describe('Customer Receipt Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates PDF download to pricingService with tracking number', async () => {
    const downloadSpy = vi.spyOn(pricingService, 'downloadReceiptPdf').mockResolvedValueOnce();

    const mockParcel: Parcel = {
      id: 'prc_001',
      trackingNumber: 'SWF-2026-TEST9999',
      status: 'delivered',
      senderId: 'usr_customer_1',
      senderName: 'Test Sender',
      senderPhone: '0771234567',
      senderType: 'customer',
      recipientName: 'Test Recipient',
      recipientPhone: '0719876543',
      recipientAddress: { street: '12 Temple Rd', city: 'Kandy', district: 'Kandy' },
      pickupAddress: { street: '45 Galle Rd', city: 'Colombo', district: 'Colombo' },
      description: 'Documents',
      weight: 1.5,
      size: 'sm',
      fragile: false,
      deliveryFee: 660,
      totalFee: 660,
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      createdAt: '2026-11-22T10:00:00Z',
      statusHistory: [],
    };

    await downloadReceipt(mockParcel);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith('SWF-2026-TEST9999');
  });

  it('propagates error when receipt download is unauthorized or fails', async () => {
    vi.spyOn(pricingService, 'downloadReceiptPdf').mockRejectedValueOnce(
      new Error('Access denied: You can only download receipts for your own parcels')
    );

    const mockParcel = {
      trackingNumber: 'SWF-2026-OTHER001',
    } as Parcel;

    await expect(downloadReceipt(mockParcel)).rejects.toThrow(
      'Access denied: You can only download receipts for your own parcels'
    );
  });
});
