import { apiClient } from '../../../lib/api-client';
import type { NotificationItem, NotificationPageResponse, UnreadCountResponse } from '../types/notification.types';

export const notificationsApi = {
  async getNotifications(page = 0, size = 20, unreadOnly?: boolean): Promise<NotificationPageResponse> {
    const params: Record<string, any> = { page, size };
    if (typeof unreadOnly === 'boolean') {
      params.unreadOnly = unreadOnly;
    }
    const response = await apiClient.get<NotificationPageResponse>('/notifications', { params });
    return response.data;
  },

  async getNotificationById(id: string): Promise<NotificationItem> {
    const response = await apiClient.get<NotificationItem>(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; markedCount: number }> {
    const response = await apiClient.post<{ success: boolean; markedCount: number }>('/notifications/mark-all-read');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.unreadCount;
  },
};
