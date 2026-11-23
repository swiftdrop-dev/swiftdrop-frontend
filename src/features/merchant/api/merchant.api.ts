import { apiClient } from '../../../lib/api-client';
import type {
  MerchantProfile,
  RegisterMerchantPayload,
  UpdateMerchantProfilePayload,
  AddAddressPayload,
  MerchantAddress,
  SetBankAccountPayload,
  MerchantBankAccount,
  UploadDocumentPayload,
  MerchantDocument,
  GenerateApiKeyPayload,
  ApiKeyCreatedResponse,
  MerchantApiCredential,
  MerchantAuditLog,
  UpdateWebhookPayload,
  PageResponse,
  PricingTier,
  Page,
} from '../types/merchant.types';
import type {
  MerchantOrder,
  MerchantOrderCreate,
  OrderQuery,
} from '../types/merchant-order.types';

// Helper to normalize backend MerchantResponse into frontend MerchantProfile
function normalizeMerchantProfile(data: any): MerchantProfile {
  if (!data) return data;
  const contacts = data.contacts || [];
  const primaryContact = contacts[0] || {};

  return {
    ...data,
    taxIdentificationNumber: data.taxId || data.taxIdentificationNumber,
    primaryContactName: data.contactName || data.primaryContactName || primaryContact.contactName || '',
    primaryContactPhone: data.contactPhone || data.primaryContactPhone || primaryContact.phone || '',
    primaryContactEmail: data.contactEmail || data.primaryContactEmail || primaryContact.email || '',
    bankAccount: data.bankAccount || (data.bankAccounts && data.bankAccounts[0]) || undefined,
    addresses: (data.addresses || []).map((a: any) => ({
      ...a,
      hubName: a.hubName || a.addressLabel || 'Main Warehouse',
      addressLine1: a.addressLine1 || a.streetAddress || '',
      contactPerson: a.contactPerson || a.contactPhone || '',
      contactPhone: a.contactPhone || '',
      isPrimaryPickup: a.isPrimaryPickup ?? true,
    })),
    documents: (data.documents || []).map((d: any) => ({
      ...d,
      documentName: d.documentName || d.fileName || 'Document',
      fileName: d.fileName || d.documentName,
      fileSize: d.fileSize || d.fileSizeBytes,
      createdAt: d.createdAt || d.uploadedAt || new Date().toISOString(),
    })),
    apiCredentials: data.apiCredentials || [],
  };
}

export const merchantApi = {
  // Onboarding
  register: async (payload: RegisterMerchantPayload): Promise<MerchantProfile> => {
    const body = {
      businessName: payload.businessName,
      tradeName: payload.tradeName,
      registrationNumber: payload.registrationNumber,
      taxId: payload.taxId || payload.taxIdentificationNumber,
      businessType: payload.businessType,
      contactName: payload.contactName || payload.primaryContactName,
      contactPhone: payload.contactPhone || payload.primaryContactPhone,
      contactEmail: payload.contactEmail || payload.primaryContactEmail,
    };
    const res = await apiClient.post<{ success: boolean; data: any }>(
      '/merchants/onboarding/register',
      body
    );
    return normalizeMerchantProfile(res.data.data);
  },

  getMyProfile: async (): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      '/merchants/onboarding/me'
    );
    return normalizeMerchantProfile(res.data.data);
  },

  getProfile: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}`
    );
    return normalizeMerchantProfile(res.data.data);
  },

  updateProfile: async (merchantId: string, payload: UpdateMerchantProfilePayload): Promise<MerchantProfile> => {
    const body = {
      businessName: payload.businessName,
      tradeName: payload.tradeName,
      taxId: payload.taxId || payload.taxIdentificationNumber,
      businessType: payload.businessType,
      webhookUrl: payload.webhookUrl,
      webhookSecret: payload.webhookSecret,
    };
    const res = await apiClient.put<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}/profile`,
      body
    );
    return normalizeMerchantProfile(res.data.data);
  },

  addAddress: async (merchantId: string, payload: AddAddressPayload): Promise<MerchantAddress> => {
    const body = {
      addressLabel: payload.addressLabel || payload.hubName || 'Warehouse',
      streetAddress: payload.streetAddress || payload.addressLine1 || '',
      city: payload.city,
      district: payload.district,
      postalCode: payload.postalCode || '10000',
      latitude: payload.latitude,
      longitude: payload.longitude,
      contactPhone: payload.contactPhone,
      isPrimaryPickup: payload.isPrimaryPickup ?? false,
    };
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}/addresses`,
      body
    );
    const data = res.data.data;
    return {
      ...data,
      hubName: data.hubName || data.addressLabel,
      addressLine1: data.addressLine1 || data.streetAddress,
    };
  },

  setBankAccount: async (merchantId: string, payload: SetBankAccountPayload): Promise<MerchantBankAccount> => {
    const res = await apiClient.put<{ success: boolean; data: MerchantBankAccount }>(
      `/merchants/onboarding/${merchantId}/bank-account`,
      payload
    );
    return res.data.data;
  },

  uploadDocument: async (merchantId: string, payload: UploadDocumentPayload): Promise<MerchantDocument> => {
    const body = {
      documentType: payload.documentType,
      fileName: payload.fileName || payload.documentName || 'Document.pdf',
      fileUrl: payload.fileUrl,
      fileSizeBytes: payload.fileSizeBytes || payload.fileSize || 1024,
      mimeType: payload.mimeType || 'application/pdf',
    };
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}/documents`,
      body
    );
    const data = res.data.data;
    return {
      ...data,
      documentName: data.documentName || data.fileName,
      createdAt: data.createdAt || data.uploadedAt,
    };
  },

  submitForReview: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}/submit`
    );
    return normalizeMerchantProfile(res.data.data);
  },

  // Credentials
  generateApiKey: async (merchantId: string, payload: GenerateApiKeyPayload = {}): Promise<ApiKeyCreatedResponse> => {
    const res = await apiClient.post<{ success: boolean; data: ApiKeyCreatedResponse }>(
      `/merchants/${merchantId}/credentials`,
      payload
    );
    return res.data.data;
  },

  listApiKeys: async (merchantId: string): Promise<MerchantApiCredential[]> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantApiCredential[] }>(
      `/merchants/${merchantId}/credentials`
    );
    return res.data.data;
  },

  revokeApiKey: async (merchantId: string, credentialId: string): Promise<void> => {
    await apiClient.delete(`/merchants/${merchantId}/credentials/${credentialId}`);
  },

  updateWebhook: async (merchantId: string, payload: UpdateWebhookPayload): Promise<void> => {
    await apiClient.put(`/merchants/onboarding/${merchantId}/webhook`, payload);
  },

  // Orders
  createOrder: async (data: MerchantOrderCreate, idempotencyKey?: string): Promise<MerchantOrder> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient.post<MerchantOrder>('/merchants/orders', data, { headers });
    return res.data;
  },

  createBulkOrders: async (orders: MerchantOrderCreate[]): Promise<any> => {
    const res = await apiClient.post('/merchants/orders/bulk', { orders });
    return res.data;
  },

  getOrders: async (query: OrderQuery = { page: 0, size: 20 }): Promise<Page<MerchantOrder>> => {
    const res = await apiClient.get<Page<MerchantOrder>>('/merchants/orders', { params: query });
    return res.data;
  },

  getOrderById: async (id: string): Promise<MerchantOrder> => {
    const res = await apiClient.get<MerchantOrder>(`/merchants/orders/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export const adminMerchantApi = {
  getMerchants: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<MerchantProfile>> => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const res = await apiClient.get<{ success: boolean; data: PageResponse<any> }>(
      `/merchants/admin?${params.toString()}`
    );
    return {
      ...res.data.data,
      content: (res.data.data.content || []).map(normalizeMerchantProfile),
    };
  },

  getMerchantById: async (merchantId: string): Promise<MerchantProfile> => {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/merchants/onboarding/${merchantId}`
    );
    return normalizeMerchantProfile(res.data.data);
  },

  approveMerchant: async (
    merchantId: string,
    notes?: string,
    pricingTier: PricingTier = 'STANDARD'
  ): Promise<{ merchant: MerchantProfile; initialApiKey?: ApiKeyCreatedResponse }> => {
    const res = await apiClient.post<{
      success: boolean;
      data: any;
    }>(`/merchants/admin/${merchantId}/approve`, {
      rejectionReason: notes,
      pricingTier,
    });
    return { merchant: normalizeMerchantProfile(res.data.data) };
  },

  rejectMerchant: async (merchantId: string, reason: string): Promise<MerchantProfile> => {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/merchants/admin/${merchantId}/reject`,
      { rejectionReason: reason }
    );
    return normalizeMerchantProfile(res.data.data);
  },

  verifyDocument: async (
    merchantId: string,
    docId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<MerchantDocument> => {
    const query = new URLSearchParams({
      approve: (status === 'APPROVED').toString(),
    });
    if (rejectionReason) query.append('reason', rejectionReason);

    const res = await apiClient.post<{ success: boolean; data: any }>(
      `/merchants/admin/${merchantId}/documents/${docId}/review?${query.toString()}`
    );
    const data = res.data.data;
    return {
      ...data,
      documentName: data.documentName || data.fileName,
      createdAt: data.createdAt || data.uploadedAt,
    };
  },

  getAuditLogs: async (merchantId: string): Promise<MerchantAuditLog[]> => {
    const res = await apiClient.get<{ success: boolean; data: MerchantAuditLog[] }>(
      `/merchants/admin/${merchantId}/audit-logs`
    );
    return res.data.data;
  },
};

