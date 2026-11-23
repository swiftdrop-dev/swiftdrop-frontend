import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MerchantWebhooksPage from './MerchantWebhooksPage';
import { merchantTestWrapper } from '../test-utils';
import { previewIntegration } from '../integration/merchant-integration';
import { merchantWebhooksApi } from '../api/merchant-webhooks.api';
import type { WebhookDelivery, WebhookEndpoint } from '../types/webhook.types';

vi.mock('../api/merchant-webhooks.api', () => ({
  merchantWebhooksApi: {
    listEndpoints: vi.fn(),
    registerEndpoint: vi.fn(),
    toggleEndpoint: vi.fn(),
    rotateSecret: vi.fn(),
    deleteEndpoint: vi.fn(),
    getDeliveries: vi.fn(),
    getDeliveryDetail: vi.fn(),
    retryDelivery: vi.fn(),
  },
}));

describe('MerchantWebhooksPage', () => {
  const mockEndpoints: WebhookEndpoint[] = [
    {
      id: 'ep-001',
      merchantId: 'preview',
      url: 'https://api.mybrand.com/webhooks/fulfillment',
      maskedSecret: 'whsec_************************a1b2',
      description: 'Primary ERP Webhook',
      isActive: true,
      subscribedEvents: ['PARCEL_OUT_FOR_DELIVERY', 'PARCEL_DELIVERED'],
      createdAt: '2026-11-20T10:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z',
    },
  ];

  const mockDeliveries: WebhookDelivery[] = [
    {
      id: 'del-101',
      endpointId: 'ep-001',
      endpointUrl: 'https://api.mybrand.com/webhooks/fulfillment',
      merchantId: 'preview',
      eventId: 'evt-2026-101',
      eventType: 'PARCEL_OUT_FOR_DELIVERY',
      trackingNumber: 'TRK99887766',
      parcelId: 'pcl-55',
      status: 'SUCCESS',
      attemptCount: 1,
      maxAttempts: 5,
      lastHttpStatus: 200,
      createdAt: '2026-11-22T08:00:00Z',
      deliveredAt: '2026-11-22T08:00:01Z',
    },
    {
      id: 'del-102',
      endpointId: 'ep-001',
      endpointUrl: 'https://api.mybrand.com/webhooks/fulfillment',
      merchantId: 'preview',
      eventId: 'evt-2026-102',
      eventType: 'PARCEL_DELIVERY_FAILED',
      trackingNumber: 'TRK99887767',
      parcelId: 'pcl-56',
      status: 'RETRYING',
      attemptCount: 2,
      maxAttempts: 5,
      lastHttpStatus: 500,
      lastError: 'HTTP 500: Server Error',
      createdAt: '2026-11-22T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(merchantWebhooksApi.listEndpoints).mockResolvedValue(mockEndpoints);
    vi.mocked(merchantWebhooksApi.getDeliveries).mockResolvedValue({
      content: mockDeliveries,
      totalElements: 2,
      totalPages: 1,
      number: 0,
    });
  });

  it('renders registered webhook endpoints with masked secret and status', async () => {
    const api = previewIntegration('approved');
    const { Wrapper } = merchantTestWrapper(api);

    render(<MerchantWebhooksPage />, { wrapper: Wrapper });

    expect(await screen.findByText('https://api.mybrand.com/webhooks/fulfillment')).toBeInTheDocument();
    expect(screen.getByText('Primary ERP Webhook')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('whsec_************************a1b2')).toBeInTheDocument();
    expect(screen.getByText('PARCEL_OUT_FOR_DELIVERY')).toBeInTheDocument();
    expect(screen.getByText('PARCEL_DELIVERED')).toBeInTheDocument();
  });

  it('opens register webhook dialog, validates HTTPS, and reveals secret on creation', async () => {
    const api = previewIntegration('approved');
    const { Wrapper } = merchantTestWrapper(api);

    vi.mocked(merchantWebhooksApi.registerEndpoint).mockResolvedValue({
      id: 'ep-new',
      merchantId: 'preview',
      url: 'https://api.store.com/wh',
      maskedSecret: 'whsec_************************zzzz',
      description: 'New store hook',
      isActive: true,
      subscribedEvents: ['PARCEL_CREATED'],
      createdAt: '2026-11-22T10:00:00Z',
      updatedAt: '2026-11-22T10:00:00Z',
      secret: 'whsec_raw_secret_only_shown_once_zzzz',
    });

    render(<MerchantWebhooksPage />, { wrapper: Wrapper });

    const registerBtn = await screen.findByRole('button', { name: /Register Webhook/i });
    await waitFor(() => expect(registerBtn).not.toBeDisabled());
    fireEvent.click(registerBtn);

    expect(await screen.findByText(/Endpoint URL/i)).toBeInTheDocument();

    // Reject non-HTTPS
    const urlInput = screen.getByPlaceholderText('https://api.yourdomain.com/webhooks');
    fireEvent.change(urlInput, { target: { value: 'http://insecure.com/wh' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register Endpoint' }));
    expect(await screen.findByText(/must use the HTTPS protocol/i)).toBeInTheDocument();

    // Valid HTTPS submission
    fireEvent.change(urlInput, { target: { value: 'https://api.store.com/wh' } });
    fireEvent.click(screen.getByRole('button', { name: 'Register Endpoint' }));

    // Should reveal secret modal
    expect(await screen.findByText('Save Your Webhook Signing Secret')).toBeInTheDocument();
    expect(screen.getByDisplayValue('whsec_raw_secret_only_shown_once_zzzz')).toBeInTheDocument();
  });

  it('toggles webhook endpoint active status', async () => {
    const api = previewIntegration('approved');
    const { Wrapper } = merchantTestWrapper(api);

    vi.mocked(merchantWebhooksApi.toggleEndpoint).mockResolvedValue({
      ...mockEndpoints[0],
      isActive: false,
    });

    render(<MerchantWebhooksPage />, { wrapper: Wrapper });

    const disableBtn = await screen.findByRole('button', { name: 'Disable' });
    fireEvent.click(disableBtn);

    await waitFor(() => {
      expect(merchantWebhooksApi.toggleEndpoint).toHaveBeenCalledWith('preview', 'ep-001');
    });
  });

  it('switches to Delivery History tab and views delivery log detail and payload', async () => {
    const api = previewIntegration('approved');
    const { Wrapper } = merchantTestWrapper(api);

    vi.mocked(merchantWebhooksApi.getDeliveryDetail).mockResolvedValue({
      ...mockDeliveries[0],
      payload: '{"eventId":"evt-2026-101","eventType":"PARCEL_OUT_FOR_DELIVERY","data":{"trackingNumber":"TRK99887766"}}',
      attempts: [
        {
          id: 'att-1',
          attemptNumber: 1,
          httpStatus: 200,
          responseBody: '{"ok":true}',
          durationMs: 142,
          attemptedAt: '2026-11-22T08:00:01Z',
        },
      ],
    });

    render(<MerchantWebhooksPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Delivery History/i }));

    expect(await screen.findByText('TRK99887766')).toBeInTheDocument();
    expect(screen.getByText('TRK99887767')).toBeInTheDocument();
    expect(screen.getAllByText('SUCCESS').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('RETRYING').length).toBeGreaterThanOrEqual(1);

    // Click view details
    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    fireEvent.click(viewButtons[0]);

    expect(await screen.findByText('Webhook Delivery Details')).toBeInTheDocument();
    expect(screen.getByText('JSON Payload')).toBeInTheDocument();
    expect(screen.getByText(/Attempt #1/)).toBeInTheDocument();
  });

  it('triggers manual retry for a retrying or failed delivery', async () => {
    const api = previewIntegration('approved');
    const { Wrapper } = merchantTestWrapper(api);

    vi.mocked(merchantWebhooksApi.retryDelivery).mockResolvedValue({
      ...mockDeliveries[1],
      attemptCount: 3,
      status: 'SUCCESS',
      lastHttpStatus: 200,
    });

    render(<MerchantWebhooksPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /Delivery History/i }));

    const retryBtn = await screen.findByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(merchantWebhooksApi.retryDelivery).toHaveBeenCalledWith('preview', 'del-102');
    });
  });
});
