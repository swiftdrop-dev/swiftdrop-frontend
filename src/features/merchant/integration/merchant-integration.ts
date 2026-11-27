import { createContext, useContext } from "react";
import type { MerchantProfile, ApiKeyMetadata, Page } from "../types/merchant.types";
import type { MerchantOrder } from "../types/merchant-order.types";
import type { createProfileService } from "../services/merchant-profile.service";
import type { createCredentialsService } from "../services/merchant-credentials.service";
import type { createOrdersService } from "../services/merchant-orders.service";
import { unavailable } from "../services/merchant-api-error";
import { apiClient } from "../../../lib/api-client";
import { merchantApi } from "../api/merchant.api";
export interface MerchantIntegration {
  mode: "unavailable" | "preview" | "live";
  accountId: string;
  managementReady: boolean;
  ordersReady: boolean;
  profile: ReturnType<typeof createProfileService>;
  credentials: ReturnType<typeof createCredentialsService>;
  orders: ReturnType<typeof createOrdersService>;
}
const disabled: MerchantIntegration = {
  mode: "unavailable",
  accountId: "unavailable",
  managementReady: false,
  ordersReady: false,
  profile: {
    get: async () => unavailable(),
    onboard: async () => unavailable(),
    update: async () => unavailable(),
  },
  credentials: {
    list: async () => unavailable(),
    issue: async () => unavailable(),
    rotate: async () => unavailable(),
    revoke: async () => unavailable(),
  },
  orders: {
    list: async () => unavailable(),
    detail: async () => unavailable(),
    create: async () => unavailable(),
  },
};
export const MerchantIntegrationContext =
  createContext<MerchantIntegration>(disabled);
export const useMerchantIntegration = () =>
  useContext(MerchantIntegrationContext);
/** Read-only development preview. No mutation succeeds and no credential is generated. */
export function previewIntegration(state: string): MerchantIntegration {
  const profile: MerchantProfile = {
    id: "preview",
    userId: "preview-user",
    businessName: "Sample Merchant",
    registrationNumber: "SAMPLE-001",
    businessType: "OTHER",
    pricingTier: "STANDARD",
    primaryContactName: "Sample Contact",
    primaryContactPhone: "+94112345678",
    primaryContactEmail: "sample@example.com",
    contactName: "Sample Contact",
    contactEmail: "sample@example.com",
    contactPhone: "+94112345678",
    pickupStreet: "Sample Street",
    pickupCity: "Colombo",
    pickupDistrict: "Colombo",
    status:
      state === "pending"
        ? "PENDING"
        : state === "rejected"
          ? "REJECTED"
          : "APPROVED",
    reviewReason:
      state === "rejected"
        ? "Sample reason: business details need clarification."
        : null,
    reviewedAt: null,
    createdAt: "2026-11-13T00:00:00Z",
    updatedAt: "2026-11-13T00:00:00Z",
    addresses: [],
    documents: [],
    apiCredentials: [],
  };
  const order: MerchantOrder = {
    id: "00000000-0000-0000-0000-000000000001",
    merchantOrderRef: "SAMPLE-ORDER",
    trackingNumber: "SAMPLE-TRACK",
    status: "PENDING",
    details: {
      merchantOrderRef: "SAMPLE-ORDER",
      recipient: { name: "Sample Recipient", phone: "+94112345678" },
      pickupAddress: {
        street: "Sample Street",
        city: "Colombo",
        district: "Colombo",
      },
      deliveryAddress: {
        street: "Sample Destination",
        city: "Kandy",
        district: "Kandy",
      },
      description: "Sample parcel",
      weightKg: 1,
      size: "SM",
      fragile: false,
      paymentMethod: "COD",
    },
    deliveryFee: 350,
    totalFee: 350,
    currency: "LKR",
    createdAt: "2026-11-13T00:00:00Z",
  };
  const key: ApiKeyMetadata = {
    id: "sample-metadata",
    name: "Sample integration",
    publicId: "sample-public-identifier",
    scopes: ["orders:read"],
    createdAt: "2026-11-13T00:00:00Z",
    expiresAt: "2027-01-01T00:00:00Z",
    revokedAt: null,
    replacementId: null,
    state: "ACTIVE",
  };
  return {
    ...disabled,
    mode: "preview",
    accountId: `preview-${state}`,
    profile: {
      ...disabled.profile,
      get: async () => (state === "new" ? null : profile),
    },
    credentials: {
      ...disabled.credentials,
      list: async (page, size) => ({
        data: page === 0 ? [key] : [],
        total: 1,
        page,
        size,
      }),
    },
    orders: {
      ...disabled.orders,
      list: async (query) => {
        const match =
          (!query.status || query.status === order.status) &&
          (!query.merchantOrderRef ||
            query.merchantOrderRef === order.merchantOrderRef) &&
          (!query.trackingNumber ||
            query.trackingNumber === order.trackingNumber) &&
          (!query.createdFrom || order.createdAt >= query.createdFrom) &&
          (!query.createdTo || order.createdAt <= query.createdTo);
        return {
          data: match && query.page === 0 ? [order] : [],
          total: match ? 1 : 0,
          page: query.page,
          size: query.size,
        };
      },
      detail: async (id) => (id === order.id ? order : unavailable()),
    },
  };
}

export function liveIntegration(accountId: string): MerchantIntegration {
  return {
    mode: "live",
    accountId,
    managementReady: true,
    ordersReady: true,
    profile: {
      get: async () => {
        try {
          return await merchantApi.getMyProfile();
        } catch (e: any) {
          if (e?.response?.status === 404 || e?.status === 404) return null;
          throw e;
        }
      },
      onboard: async (data) => {
        return await merchantApi.register({
          businessName: data.businessName,
          registrationNumber: data.registrationNumber,
          businessType: "OTHER",
          primaryContactName: data.contactName,
          primaryContactEmail: data.contactEmail,
          primaryContactPhone: data.contactPhone,
        });
      },
      update: async (data) => {
        const profile = await merchantApi.getMyProfile();
        return await merchantApi.updateProfile(profile.id, {
          businessName: profile.businessName,
          tradeName: profile.tradeName,
          taxId: profile.taxIdentificationNumber || profile.taxId,
          businessType: profile.businessType,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          pickupStreet: data.pickupStreet,
          pickupCity: data.pickupCity,
          pickupDistrict: data.pickupDistrict,
        });
      },
    },
    credentials: {
      list: async (page, size) => {
        try {
          const profile = await merchantApi.getMyProfile();
          const keys = await merchantApi.listApiKeys(profile.id);
          const mapped: ApiKeyMetadata[] = (keys || []).map((k) => ({
            id: k.id,
            name: k.keyPrefix,
            publicId: k.keyPrefix,
            scopes: ["orders:read", "orders:write"],
            createdAt: k.createdAt,
            expiresAt: k.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
            revokedAt: null,
            replacementId: null,
            state: "ACTIVE",
          }));
          return {
            data: mapped.slice(page * size, (page + 1) * size),
            total: mapped.length,
            page,
            size,
          };
        } catch {
          return { data: [], total: 0, page, size };
        }
      },
      issue: async (data) => {
        const profile = await merchantApi.getMyProfile();
        const res = await merchantApi.generateApiKey(profile.id, {
          label: data.name,
          environment: "PRODUCTION",
        });
        const meta: ApiKeyMetadata = {
          id: res.id,
          name: res.keyPrefix,
          publicId: res.keyPrefix,
          scopes: data.scopes,
          createdAt: new Date().toISOString(),
          expiresAt: res.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
          revokedAt: null,
          replacementId: null,
          state: "ACTIVE",
        };
        return {
          credential: meta,
          apiKey: res.rawApiKey,
        };
      },
      rotate: async (id, expiresAt) => {
        const profile = await merchantApi.getMyProfile();
        await merchantApi.revokeApiKey(profile.id, id);
        const res = await merchantApi.generateApiKey(profile.id, {
          label: "Rotated API Key",
          environment: "PRODUCTION",
        });
        const meta: ApiKeyMetadata = {
          id: res.id,
          name: res.keyPrefix,
          publicId: res.keyPrefix,
          scopes: ["orders:read", "orders:write"],
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt || res.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
          revokedAt: null,
          replacementId: null,
          state: "ACTIVE",
        };
        return {
          credential: meta,
          apiKey: res.rawApiKey,
        };
      },
      revoke: async (id) => {
        const profile = await merchantApi.getMyProfile();
        await merchantApi.revokeApiKey(profile.id, id);
      },
    },
    orders: {
      list: async (query, signal) => {
        const res = await apiClient.get<Page<MerchantOrder>>("/merchants/orders", {
          params: query,
          signal,
        });
        return res.data;
      },
      detail: async (id) => {
        const res = await apiClient.get<MerchantOrder>(`/merchants/orders/${encodeURIComponent(id)}`);
        return res.data;
      },
      create: async (data, key) => {
        const res = await apiClient.post<MerchantOrder>("/merchants/orders", data, {
          headers: { "Idempotency-Key": key },
        });
        return res.data;
      },
    },
  };
}
