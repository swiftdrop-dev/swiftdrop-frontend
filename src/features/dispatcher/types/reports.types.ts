export interface DashboardKpis {
  totalParcels: number | null;
  pendingParcels: number | null;
  unassignedDeliveries: number | null;
  assignedDeliveries: number | null;
  inTransitDeliveries: number | null;
  deliveredParcels: number | null;
  failedDeliveries: number | null;
  activeCouriers: number | null;
  totalCouriers: number | null;
  registeredCustomers: number | null;
  registeredMerchants: number | null;
  pendingMerchantApplications: number | null;
  totalRevenue: number | null;
  successRate: number | null;
  averageDeliveryTimeHours: number | null;
  isPartial?: boolean;
  sourceAvailability?: Record<string, string>;
  dataFreshness?: string;
}

export interface DailyVolumeItem {
  date: string;
  total: number;
  delivered: number;
  failed: number;
  revenue: number;
}

export interface ParcelVolumeReport {
  period: string;
  totalVolume: number;
  dailyStats: DailyVolumeItem[];
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface StatusDistributionReport {
  total: number;
  distribution: StatusDistributionItem[];
}

export interface DeliveryPerformanceReport {
  totalDeliveries: number | null;
  delivered: number | null;
  failed: number | null;
  successRate: number | null;
  averageDeliveryTimeHours: number | null;
  onTimeRate: number | null;
}

export interface CourierPerformanceItem {
  courierId: string;
  name: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number | null;
  isAvailable: boolean;
  deliveriesToday: number;
  totalDeliveries: number;
}

export interface CourierPerformanceReport {
  totalCouriers: number;
  activeCouriers: number;
  couriers: CourierPerformanceItem[];
}
