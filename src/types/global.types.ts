export type UserRole = 'customer' | 'merchant' | 'courier' | 'dispatcher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ──────────────────────────────────────────────
// PARCEL / DELIVERY
// ──────────────────────────────────────────────
export type ParcelStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'returned';

export type ParcelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface Address {
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  status: ParcelStatus;

  // Sender
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderType: 'customer' | 'merchant';

  // Recipient
  recipientName: string;
  recipientPhone: string;
  recipientAddress: Address;

  // Pickup
  pickupAddress: Address;

  // Package details
  description: string;
  weight: number; // kg
  size: ParcelSize;
  declaredValue?: number;
  fragile: boolean;
  specialInstructions?: string;

  // Financials
  deliveryFee: number;
  insuranceFee?: number;
  totalFee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'cod' | 'online';

  // Assignment
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  dispatcherId?: string;

  // Proof
  proofPhotoUrl?: string;
  signatureUrl?: string;

  // Timestamps
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;

  // Status history
  statusHistory: StatusEvent[];

  // Customer feedback (Priority C - M2 enhancement)
  rating?: number;
  feedbackComment?: string;
  feedbackSubmittedAt?: string;
}

export interface StatusEvent {
  status: ParcelStatus;
  timestamp: string;
  note?: string;
  location?: string;
  updatedBy?: string;
}

// ──────────────────────────────────────────────
// BOOKING FORM
// ──────────────────────────────────────────────
export interface BookingFormData {
  recipientName: string;
  recipientPhone: string;
  pickupStreet: string;
  pickupCity: string;
  pickupDistrict: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryDistrict: string;
  description: string;
  weight: number;
  size: ParcelSize;
  declaredValue?: number;
  fragile: boolean;
  specialInstructions?: string;
  paymentMethod: 'cod' | 'online';
}

export interface FeeEstimate {
  baseFee: number;
  weightFee: number;
  distanceFee: number;
  fragileHandling: number;
  insuranceFee: number;
  totalFee: number;
  estimatedDays: number;
}

// ──────────────────────────────────────────────
// COURIER
// ──────────────────────────────────────────────
export interface Courier extends User {
  vehicleType: 'bike' | 'scooter' | 'van' | 'truck';
  vehiclePlate: string;
  currentLocation?: { lat: number; lng: number };
  isAvailable: boolean;
  deliveriesToday: number;
  totalDeliveries: number;
  rating: number;
}

// ──────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────
export interface DailyStats {
  date: string;
  total: number;
  delivered: number;
  failed: number;
  revenue: number;
}

export interface ReportSummary {
  totalParcels: number;
  deliveredParcels: number;
  failedParcels: number;
  pendingParcels: number;
  totalRevenue: number;
  averageDeliveryTime: number; // hours
  successRate: number; // %
  dailyStats: DailyStats[];
}

// ──────────────────────────────────────────────
// API
// ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ──────────────────────────────────────────────
// NOTIFICATION
// ──────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
