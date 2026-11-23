import { apiClient } from '../../../lib/api-client';
import type {
  RegisterWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  WebhookDeliveryDetail,
  WebhookEndpoint,
  WebhookEndpointCreated,
} from '../types/webhook.types';

export const merchantWebhooksApi = {
  listEndpoints: async (merchantId: string): Promise<WebhookEndpoint[]> => {
    const res = await apiClient.get<{ success: boolean; data: WebhookEndpoint[] }>(
      `/merchants/${merchantId}/webhooks`
    );
    return res.data.data;
  },

  registerEndpoint: async (
    merchantId: string,
    payload: RegisterWebhookRequest
  ): Promise<WebhookEndpointCreated> => {
    const res = await apiClient.post<{ success: boolean; data: WebhookEndpointCreated }>(
      `/merchants/${merchantId}/webhooks`,
      payload
    );
    return res.data.data;
  },

  getEndpoint: async (merchantId: string, endpointId: string): Promise<WebhookEndpoint> => {
    const res = await apiClient.get<{ success: boolean; data: WebhookEndpoint }>(
      `/merchants/${merchantId}/webhooks/${endpointId}`
    );
    return res.data.data;
  },

  updateEndpoint: async (
    merchantId: string,
    endpointId: string,
    payload: UpdateWebhookRequest
  ): Promise<WebhookEndpoint> => {
    const res = await apiClient.put<{ success: boolean; data: WebhookEndpoint }>(
      `/merchants/${merchantId}/webhooks/${endpointId}`,
      payload
    );
    return res.data.data;
  },

  toggleEndpoint: async (merchantId: string, endpointId: string): Promise<WebhookEndpoint> => {
    const res = await apiClient.patch<{ success: boolean; data: WebhookEndpoint }>(
      `/merchants/${merchantId}/webhooks/${endpointId}/toggle`
    );
    return res.data.data;
  },

  deleteEndpoint: async (merchantId: string, endpointId: string): Promise<void> => {
    await apiClient.delete(`/merchants/${merchantId}/webhooks/${endpointId}`);
  },

  rotateSecret: async (
    merchantId: string,
    endpointId: string
  ): Promise<WebhookEndpointCreated> => {
    const res = await apiClient.post<{ success: boolean; data: WebhookEndpointCreated }>(
      `/merchants/${merchantId}/webhooks/${endpointId}/rotate-secret`
    );
    return res.data.data;
  },

  getDeliveries: async (
    merchantId: string,
    params?: { eventType?: string; status?: string; page?: number; size?: number }
  ): Promise<{ content: WebhookDelivery[]; totalElements: number; totalPages: number; number: number }> => {
    const res = await apiClient.get<{
      success: boolean;
      data: { content: WebhookDelivery[]; totalElements: number; totalPages: number; number: number };
    }>(`/merchants/${merchantId}/webhooks/deliveries`, { params });
    return res.data.data;
  },

  getDeliveryDetail: async (
    merchantId: string,
    deliveryId: string
  ): Promise<WebhookDeliveryDetail> => {
    const res = await apiClient.get<{ success: boolean; data: WebhookDeliveryDetail }>(
      `/merchants/${merchantId}/webhooks/deliveries/${deliveryId}`
    );
    return res.data.data;
  },

  retryDelivery: async (merchantId: string, deliveryId: string): Promise<WebhookDelivery> => {
    const res = await apiClient.post<{ success: boolean; data: WebhookDelivery }>(
      `/merchants/${merchantId}/webhooks/deliveries/${deliveryId}/retry`
    );
    return res.data.data;
  },
};
