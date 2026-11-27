export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'COURIER_ASSIGNED'
  | 'PARCEL_PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_FAILED'
  | 'DELIVERY_SUCCESSFUL';

export type DeliveryStatus = 'SENT' | 'FAILED' | 'PENDING';

export interface NotificationItem {
  id: string;
  eventId: string;
  parcelId: string;
  trackingNumber: string;
  recipientId: string;
  channel: NotificationChannel;
  notificationType: NotificationType;
  subject: string;
  message: string;
  deliveryStatus: DeliveryStatus;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
