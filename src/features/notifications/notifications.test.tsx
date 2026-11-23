import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationBellPopover } from './components/NotificationBellPopover';
import { notificationsApi } from './api/notifications.api';
import type { NotificationItem } from './types/notification.types';

vi.mock('../../features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'cust-1', name: 'John Doe', role: 'customer' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../features/chatbot', () => ({
  ChatbotWidget: () => null,
}));

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    eventId: 'evt-1',
    parcelId: 'pcl-1',
    trackingNumber: 'SWD-12345',
    recipientId: 'cust-1',
    channel: 'EMAIL',
    notificationType: 'BOOKING_CONFIRMED',
    subject: 'Booking Confirmed - SWD-12345',
    message: 'Your parcel booking SWD-12345 has been confirmed.',
    deliveryStatus: 'SENT',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    eventId: 'evt-2',
    parcelId: 'pcl-2',
    trackingNumber: 'SWD-67890',
    recipientId: 'cust-1',
    channel: 'SMS',
    notificationType: 'OUT_FOR_DELIVERY',
    subject: 'Out for Delivery - SWD-67890',
    message: 'Your package SWD-67890 is out for delivery today.',
    deliveryStatus: 'SENT',
    isRead: true,
    readAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

describe('Customer Notifications Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NotificationBellPopover Component', () => {
    it('renders bell button and displays unread badge count', async () => {
      vi.spyOn(notificationsApi, 'getUnreadCount').mockResolvedValue(1);
      vi.spyOn(notificationsApi, 'getNotifications').mockResolvedValue({
        content: mockNotifications,
        page: 0,
        size: 5,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        unreadCount: 1,
      });

      render(
        <MemoryRouter>
          <NotificationBellPopover />
        </MemoryRouter>
      );

      // Verify unread badge shows "1"
      expect(await screen.findByText('1')).toBeInTheDocument();

      // Click bell icon to open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(button);

      // Verify dropdown content
      expect(await screen.findByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Booking Confirmed - SWD-12345')).toBeInTheDocument();
      expect(screen.getByText(/Simulated EMAIL/i)).toBeInTheDocument();
      expect(screen.getByText('View all notifications →')).toBeInTheDocument();
    });
  });

  describe('NotificationsPage Component', () => {
    it('renders notification list with simulated badges and tracking links', async () => {
      vi.spyOn(notificationsApi, 'getNotifications').mockResolvedValue({
        content: mockNotifications,
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        unreadCount: 1,
      });

      render(
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      );

      expect(await screen.findByText('Delivery Notifications')).toBeInTheDocument();
      expect(screen.getByText(/Simulated Notification Network/i)).toBeInTheDocument();
      expect(screen.getByText('Booking Confirmed - SWD-12345')).toBeInTheDocument();
      expect(screen.getByText('Out for Delivery - SWD-67890')).toBeInTheDocument();

      // Verify tracking link exists
      const trackLink = screen.getByRole('link', { name: /Track Parcel \(SWD-12345\)/i });
      expect(trackLink).toBeInTheDocument();
      expect(trackLink.getAttribute('href')).toBe('/track?number=SWD-12345');

      // Verify simulated provider tags
      expect(screen.getAllByText(/Simulated EMAIL/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Simulated SMS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('handles mark single notification as read', async () => {
      vi.spyOn(notificationsApi, 'getNotifications').mockResolvedValue({
        content: [...mockNotifications],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        unreadCount: 1,
      });
      const markAsReadSpy = vi.spyOn(notificationsApi, 'markAsRead').mockResolvedValue({
        ...mockNotifications[0],
        isRead: true,
      });

      render(
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      );

      const markBtn = await screen.findByRole('button', { name: /Mark as read/i });
      fireEvent.click(markBtn);

      await waitFor(() => {
        expect(markAsReadSpy).toHaveBeenCalledWith('notif-1');
      });
    });

    it('handles mark all as read', async () => {
      vi.spyOn(notificationsApi, 'getNotifications').mockResolvedValue({
        content: [...mockNotifications],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        unreadCount: 1,
      });
      const markAllSpy = vi.spyOn(notificationsApi, 'markAllAsRead').mockResolvedValue({
        success: true,
        markedCount: 1,
      });

      render(
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      );

      const markAllBtn = await screen.findByRole('button', { name: /Mark All Read/i });
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(markAllSpy).toHaveBeenCalled();
      });
    });

    it('renders empty state when no notifications are returned', async () => {
      vi.spyOn(notificationsApi, 'getNotifications').mockResolvedValue({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        unreadCount: 0,
      });

      render(
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      );

      expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
      expect(screen.getByText(/When you book a parcel or courier dispatch status changes/i)).toBeInTheDocument();
    });
  });
});
