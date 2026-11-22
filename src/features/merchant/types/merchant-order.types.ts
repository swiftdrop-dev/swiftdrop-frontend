export const ORDER_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
  "RETURNED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export interface OrderAddress {
  street: string;
  city: string;
  district: string;
  postalCode?: string | null;
}
export interface MerchantOrderCreate {
  merchantOrderRef: string;
  recipient: { name: string; phone: string };
  pickupAddress: OrderAddress;
  deliveryAddress: OrderAddress;
  description: string;
  weightKg: number;
  size: "XS" | "SM" | "MD" | "LG" | "XL";
  declaredValue?: number | null;
  fragile: boolean;
  specialInstructions?: string | null;
  paymentMethod: "COD" | "ONLINE";
}
export interface MerchantOrder {
  id: string;
  merchantOrderRef: string;
  trackingNumber: string;
  status: OrderStatus;
  details: MerchantOrderCreate;
  deliveryFee: number;
  totalFee: number;
  currency: string;
  createdAt: string;
}
export interface OrderQuery {
  page: number;
  size: number;
  status?: OrderStatus;
  merchantOrderRef?: string;
  trackingNumber?: string;
  createdFrom?: string;
  createdTo?: string;
}
