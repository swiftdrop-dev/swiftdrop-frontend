import { createContext, useContext } from "react";
import type { MerchantProfile, ApiKeyMetadata } from "../types/merchant.types";
import type { MerchantOrder } from "../types/merchant-order.types";
import type { createProfileService } from "../services/merchant-profile.service";
import type { createCredentialsService } from "../services/merchant-credentials.service";
import type { createOrdersService } from "../services/merchant-orders.service";
import { unavailable } from "../services/merchant-api-error";
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
    businessName: "Sample Merchant",
    registrationNumber: "SAMPLE-001",
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
