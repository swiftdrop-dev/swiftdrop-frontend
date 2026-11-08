import type { Parcel, Courier, ReportSummary, User } from '../types/global.types';

// ──────────────────────────────────────────────
// MOCK USERS
// ──────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 'usr_001', email: 'customer@demo.com', name: 'Amal Perera', role: 'customer', phone: '077-1234567' },
  { id: 'usr_002', email: 'merchant@demo.com', name: 'Lanka Traders', role: 'merchant', phone: '011-5678900' },
  { id: 'usr_003', email: 'courier@demo.com', name: 'Nimal Senanayake', role: 'courier', phone: '076-9876543' },
  { id: 'usr_004', email: 'dispatcher@demo.com', name: 'Saman Kumarasinghe', role: 'dispatcher', phone: '011-2345678' },
];

// ──────────────────────────────────────────────
// MOCK COURIERS
// ──────────────────────────────────────────────
export const MOCK_COURIERS: Courier[] = [
  {
    id: 'cou_001', email: 'nimal@swiftdrop.lk', name: 'Nimal Senanayake', role: 'courier',
    vehicleType: 'bike', vehiclePlate: 'WP-2345', isAvailable: true,
    deliveriesToday: 8, totalDeliveries: 342, rating: 4.8, phone: '076-9876543',
  },
  {
    id: 'cou_002', email: 'kasun@swiftdrop.lk', name: 'Kasun Fernando', role: 'courier',
    vehicleType: 'scooter', vehiclePlate: 'CP-9876', isAvailable: true,
    deliveriesToday: 5, totalDeliveries: 210, rating: 4.6, phone: '071-2345678',
  },
  {
    id: 'cou_003', email: 'priya@swiftdrop.lk', name: 'Priya Ranasinghe', role: 'courier',
    vehicleType: 'van', vehiclePlate: 'SP-1122', isAvailable: false,
    deliveriesToday: 12, totalDeliveries: 580, rating: 4.9, phone: '070-5566778',
  },
  {
    id: 'cou_004', email: 'dilshan@swiftdrop.lk', name: 'Dilshan Jayawardena', role: 'courier',
    vehicleType: 'bike', vehiclePlate: 'NW-4433', isAvailable: true,
    deliveriesToday: 3, totalDeliveries: 98, rating: 4.4, phone: '077-8899001',
  },
];

// ──────────────────────────────────────────────
// MOCK PARCELS
// ──────────────────────────────────────────────
export const MOCK_PARCELS: Parcel[] = [
  {
    id: 'prc_001', trackingNumber: 'SWF-2024-001234', status: 'delivered',
    senderId: 'usr_001', senderName: 'Amal Perera', senderPhone: '077-1234567', senderType: 'customer',
    recipientName: 'Kamani Silva', recipientPhone: '072-3456789',
    recipientAddress: { street: '45 Galle Road', city: 'Colombo', district: 'Colombo', postalCode: '00300' },
    pickupAddress: { street: '12 Kandy Road', city: 'Colombo', district: 'Colombo', postalCode: '00100' },
    description: 'Electronics - Laptop', weight: 2.5, size: 'md', declaredValue: 85000, fragile: true,
    deliveryFee: 350, insuranceFee: 85, totalFee: 435, paymentStatus: 'paid', paymentMethod: 'online',
    courierId: 'cou_001', courierName: 'Nimal Senanayake', courierPhone: '076-9876543',
    createdAt: '2024-11-01T09:00:00Z', deliveredAt: '2024-11-01T15:30:00Z',
    estimatedDeliveryDate: '2024-11-01',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-01T09:00:00Z', note: 'Booking confirmed', location: 'Colombo Hub' },
      { status: 'assigned', timestamp: '2024-11-01T09:30:00Z', note: 'Assigned to Nimal', location: 'Colombo Hub' },
      { status: 'picked_up', timestamp: '2024-11-01T10:45:00Z', note: 'Package picked up', location: 'Kandy Road' },
      { status: 'in_transit', timestamp: '2024-11-01T11:30:00Z', note: 'En route to destination', location: 'Baseline Road' },
      { status: 'delivered', timestamp: '2024-11-01T15:30:00Z', note: 'Delivered successfully', location: 'Galle Road' },
    ],
  },
  {
    id: 'prc_002', trackingNumber: 'SWF-2024-001235', status: 'in_transit',
    senderId: 'usr_001', senderName: 'Amal Perera', senderPhone: '077-1234567', senderType: 'customer',
    recipientName: 'Roshan Mendis', recipientPhone: '071-8765432',
    recipientAddress: { street: '88 Flower Road', city: 'Kandy', district: 'Kandy', postalCode: '20000' },
    pickupAddress: { street: '12 Kandy Road', city: 'Colombo', district: 'Colombo', postalCode: '00100' },
    description: 'Clothes & Accessories', weight: 0.8, size: 'sm', fragile: false,
    deliveryFee: 550, totalFee: 550, paymentStatus: 'pending', paymentMethod: 'cod',
    courierId: 'cou_002', courierName: 'Kasun Fernando', courierPhone: '071-2345678',
    createdAt: '2024-11-05T08:00:00Z',
    estimatedDeliveryDate: '2024-11-06',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-05T08:00:00Z', note: 'Booking confirmed' },
      { status: 'assigned', timestamp: '2024-11-05T09:00:00Z', note: 'Assigned to Kasun' },
      { status: 'picked_up', timestamp: '2024-11-05T11:00:00Z', note: 'Package collected' },
      { status: 'in_transit', timestamp: '2024-11-05T14:00:00Z', note: 'In transit to Kandy' },
    ],
  },
  {
    id: 'prc_003', trackingNumber: 'SWF-2024-001236', status: 'pending',
    senderId: 'usr_001', senderName: 'Amal Perera', senderPhone: '077-1234567', senderType: 'customer',
    recipientName: 'Dilini Jayasekara', recipientPhone: '075-5554433',
    recipientAddress: { street: '22 Main Street', city: 'Galle', district: 'Galle', postalCode: '80000' },
    pickupAddress: { street: '12 Kandy Road', city: 'Colombo', district: 'Colombo', postalCode: '00100' },
    description: 'Books', weight: 1.2, size: 'sm', fragile: false,
    deliveryFee: 650, totalFee: 650, paymentStatus: 'pending', paymentMethod: 'cod',
    createdAt: '2024-11-06T10:00:00Z',
    estimatedDeliveryDate: '2024-11-07',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-06T10:00:00Z', note: 'Awaiting assignment' },
    ],
  },
  {
    id: 'prc_004', trackingNumber: 'SWF-2024-001237', status: 'assigned',
    senderId: 'usr_002', senderName: 'Lanka Traders', senderPhone: '011-5678900', senderType: 'merchant',
    recipientName: 'Thilak Bandara', recipientPhone: '076-1122334',
    recipientAddress: { street: '5 Lake Drive', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000' },
    pickupAddress: { street: '78 Industrial Zone', city: 'Colombo', district: 'Colombo', postalCode: '00200' },
    description: 'Auto Parts', weight: 5.0, size: 'lg', fragile: false,
    deliveryFee: 850, totalFee: 850, paymentStatus: 'paid', paymentMethod: 'online',
    courierId: 'cou_001', courierName: 'Nimal Senanayake', courierPhone: '076-9876543',
    createdAt: '2024-11-06T07:00:00Z',
    estimatedDeliveryDate: '2024-11-07',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-06T07:00:00Z', note: 'Submitted by merchant' },
      { status: 'assigned', timestamp: '2024-11-06T08:00:00Z', note: 'Courier assigned' },
    ],
  },
  {
    id: 'prc_005', trackingNumber: 'SWF-2024-001238', status: 'picked_up',
    senderId: 'usr_002', senderName: 'Lanka Traders', senderPhone: '011-5678900', senderType: 'merchant',
    recipientName: 'Sunil Wickrama', recipientPhone: '070-9988776',
    recipientAddress: { street: '10 Temple Road', city: 'Negombo', district: 'Gampaha', postalCode: '11500' },
    pickupAddress: { street: '78 Industrial Zone', city: 'Colombo', district: 'Colombo', postalCode: '00200' },
    description: 'Garments - 3 boxes', weight: 3.5, size: 'md', fragile: false,
    deliveryFee: 450, totalFee: 450, paymentStatus: 'paid', paymentMethod: 'online',
    courierId: 'cou_003', courierName: 'Priya Ranasinghe', courierPhone: '070-5566778',
    createdAt: '2024-11-06T06:00:00Z',
    estimatedDeliveryDate: '2024-11-06',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-06T06:00:00Z', note: 'Order placed' },
      { status: 'assigned', timestamp: '2024-11-06T06:30:00Z', note: 'Assigned to Priya' },
      { status: 'picked_up', timestamp: '2024-11-06T08:30:00Z', note: 'Package collected from warehouse' },
    ],
  },
  {
    id: 'prc_006', trackingNumber: 'SWF-2024-001239', status: 'delivered',
    senderId: 'usr_002', senderName: 'Lanka Traders', senderPhone: '011-5678900', senderType: 'merchant',
    recipientName: 'Nalini Kumar', recipientPhone: '074-6677889',
    recipientAddress: { street: '99 Green Path', city: 'Colombo', district: 'Colombo', postalCode: '00300' },
    pickupAddress: { street: '78 Industrial Zone', city: 'Colombo', district: 'Colombo', postalCode: '00200' },
    description: 'Household Items', weight: 1.0, size: 'sm', fragile: false,
    deliveryFee: 250, totalFee: 250, paymentStatus: 'paid', paymentMethod: 'cod',
    courierId: 'cou_004', courierName: 'Dilshan Jayawardena', courierPhone: '077-8899001',
    createdAt: '2024-11-05T10:00:00Z', deliveredAt: '2024-11-05T16:00:00Z',
    estimatedDeliveryDate: '2024-11-05',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-05T10:00:00Z' },
      { status: 'assigned', timestamp: '2024-11-05T10:30:00Z' },
      { status: 'picked_up', timestamp: '2024-11-05T12:00:00Z' },
      { status: 'in_transit', timestamp: '2024-11-05T13:00:00Z' },
      { status: 'delivered', timestamp: '2024-11-05T16:00:00Z', note: 'Handed to recipient' },
    ],
  },
  {
    id: 'prc_007', trackingNumber: 'SWF-2024-001240', status: 'cancelled',
    senderId: 'usr_001', senderName: 'Amal Perera', senderPhone: '077-1234567', senderType: 'customer',
    recipientName: 'Anjali Wijeratne', recipientPhone: '072-1122334',
    recipientAddress: { street: '7 Hospital Road', city: 'Matara', district: 'Matara', postalCode: '81000' },
    pickupAddress: { street: '12 Kandy Road', city: 'Colombo', district: 'Colombo', postalCode: '00100' },
    description: 'Gift Items', weight: 0.5, size: 'xs', fragile: true,
    deliveryFee: 700, totalFee: 700, paymentStatus: 'refunded', paymentMethod: 'online',
    createdAt: '2024-11-04T09:00:00Z',
    estimatedDeliveryDate: '2024-11-05',
    statusHistory: [
      { status: 'pending', timestamp: '2024-11-04T09:00:00Z' },
      { status: 'cancelled', timestamp: '2024-11-04T11:00:00Z', note: 'Cancelled by customer' },
    ],
  },
];

// ──────────────────────────────────────────────
// MOCK REPORT DATA
// ──────────────────────────────────────────────
export const MOCK_REPORT: ReportSummary = {
  totalParcels: 1284,
  deliveredParcels: 1089,
  failedParcels: 67,
  pendingParcels: 128,
  totalRevenue: 648500,
  averageDeliveryTime: 5.4,
  successRate: 94.2,
  dailyStats: [
    { date: 'Oct 31', total: 168, delivered: 145, failed: 8, revenue: 82500 },
    { date: 'Nov 1', total: 195, delivered: 172, failed: 11, revenue: 97000 },
    { date: 'Nov 2', total: 142, delivered: 130, failed: 6, revenue: 73400 },
    { date: 'Nov 3', total: 88, delivered: 81, failed: 3, revenue: 44200 },
    { date: 'Nov 4', total: 210, delivered: 188, failed: 14, revenue: 105600 },
    { date: 'Nov 5', total: 231, delivered: 208, failed: 9, revenue: 115800 },
    { date: 'Nov 6', total: 250, delivered: 165, failed: 16, revenue: 130000 },
  ],
};
