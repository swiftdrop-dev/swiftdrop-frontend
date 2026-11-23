export type WebhookEventType =
  | 'PARCEL_CREATED'
  | 'PARCEL_ASSIGNED'
  | 'PARCEL_PICKED_UP'
  | 'PARCEL_IN_TRANSIT'
  | 'PARCEL_OUT_FOR_DELIVERY'
  | 'PARCEL_DELIVERY_FAILED'
  | 'PARCEL_DELIVERED';

export const ALL_WEBHOOK_EVENT_TYPES: { type: WebhookEventType; label: string; description: string }[] = [
  { type: 'PARCEL_CREATED', label: 'Parcel Created', description: 'When a new parcel shipment is booked' },
  { type: 'PARCEL_ASSIGNED', label: 'Courier Assigned', description: 'When a courier accepts the dispatch assignment' },
  { type: 'PARCEL_PICKED_UP', label: 'Parcel Picked Up', description: 'When the courier collects the parcel from pickup' },
  { type: 'PARCEL_IN_TRANSIT', label: 'In Transit', description: 'When the parcel is moving between hubs' },
  { type: 'PARCEL_OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'When courier begins final delivery attempt' },
  { type: 'PARCEL_DELIVERY_FAILED', label: 'Delivery Failed', description: 'When a delivery attempt could not be completed' },
  { type: 'PARCEL_DELIVERED', label: 'Delivered', description: 'When the parcel is successfully delivered to recipient' },
];

export type WebhookDeliveryStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRYING';

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  maskedSecret: string;
  description?: string | null;
  isActive: boolean;
  subscribedEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEndpointCreated extends WebhookEndpoint {
  secret: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId?: string;
  endpointUrl?: string;
  merchantId: string;
  eventId: string;
  eventType: string;
  trackingNumber?: string;
  parcelId?: string;
  status: WebhookDeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: string | null;
  lastHttpStatus?: number | null;
  lastError?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
}

export interface WebhookDeliveryAttempt {
  id: string;
  attemptNumber: number;
  httpStatus?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  durationMs?: number | null;
  attemptedAt: string;
}

export interface WebhookDeliveryDetail extends WebhookDelivery {
  payload: string;
  attempts: WebhookDeliveryAttempt[];
}

export interface RegisterWebhookRequest {
  url: string;
  description?: string;
  subscribedEvents?: string[];
}

export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
  subscribedEvents?: string[];
  isActive?: boolean;
}
