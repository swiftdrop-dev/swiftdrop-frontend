import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  ExternalLink,
  Mail,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { notificationsApi } from '../api/notifications.api';
import type { NotificationItem } from '../types/notification.types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const pageSize = 10;

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getNotifications(currentPage, pageSize, unreadOnly ? true : undefined);
      setNotifications(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages || 1);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setActionInProgress(id);
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (unreadOnly) {
        // Reload to update list if filtering by unread
        loadNotifications();
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionInProgress('ALL');
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      if (unreadOnly) {
        loadNotifications();
      }
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatNotificationType = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'Booking Confirmed';
      case 'COURIER_ASSIGNED':
        return 'Courier Assigned';
      case 'PARCEL_PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERY_FAILED':
        return 'Delivery Failed';
      case 'DELIVERY_SUCCESSFUL':
        return 'Delivered';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="customer-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Delivery Notifications
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
              Real-time delivery lifecycle updates delivered to your simulated customer inbox
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={loadNotifications}
              disabled={isLoading}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Refresh notifications"
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionInProgress === 'ALL' || isLoading}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <CheckCheck size={14} />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Simulation Notice Banner */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Info size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: '#60a5fa' }}>Simulated Notification Network: </strong>
            In this environment, notifications are handled by SwiftDrop's simulated Email and SMS dispatchers. Outgoing messages are safely logged and simulated without contacting live external gateways.
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 8,
          }}
        >
          <button
            onClick={() => {
              setUnreadOnly(false);
              setCurrentPage(0);
            }}
            style={{
              background: !unreadOnly ? 'var(--bg-raised)' : 'transparent',
              color: !unreadOnly ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: !unreadOnly ? '1px solid var(--border-strong)' : '1px solid transparent',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>All Notifications</span>
            <span
              style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {totalElements}
            </span>
          </button>

          <button
            onClick={() => {
              setUnreadOnly(true);
              setCurrentPage(0);
            }}
            style={{
              background: unreadOnly ? 'var(--bg-raised)' : 'transparent',
              color: unreadOnly ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: unreadOnly ? '1px solid var(--border-strong)' : '1px solid transparent',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Filter size={13} />
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'rgba(255, 77, 79, 0.2)',
                  color: '#ff4d4f',
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        {isLoading && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14 }}>Fetching your notifications...</p>
          </div>
        )}

        {error && !isLoading && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: 'rgba(255, 77, 79, 0.08)',
              border: '1px solid rgba(255, 77, 79, 0.25)',
              borderRadius: 10,
              color: 'var(--danger)',
              margin: '20px 0',
            }}
          >
            <AlertCircle size={28} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Unable to load notifications</p>
            <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 14px' }}>{error}</p>
            <button
              onClick={loadNotifications}
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div
            style={{
              padding: 56,
              textAlign: 'center',
              background: 'var(--bg-raised)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 12,
              margin: '16px 0',
            }}
          >
            <Bell size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 18px', lineHeight: 1.5 }}>
              {unreadOnly
                ? "You've read all your notifications. Switch to 'All Notifications' to see your complete history."
                : "When you book a parcel or courier dispatch status changes, automated simulated notifications will appear here in real time."}
            </p>
            {unreadOnly && (
              <button
                onClick={() => setUnreadOnly(false)}
                className="btn btn-outline"
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                View All Notifications
              </button>
            )}
          </div>
        )}

        {/* Notifications Feed */}
        {!isLoading && !error && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(item => (
              <div
                key={item.id}
                style={{
                  background: item.isRead ? 'var(--bg-raised)' : 'var(--bg-base)',
                  border: item.isRead
                    ? '1px solid var(--border-subtle)'
                    : '1px solid var(--signal, #3b82f6)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  boxShadow: item.isRead ? 'none' : '0 2px 10px rgba(59, 130, 246, 0.1)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Status bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Simulated Provider Tag */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: item.channel === 'EMAIL' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: item.channel === 'EMAIL' ? '#60a5fa' : '#34d399',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {item.channel === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                      Simulated {item.channel}
                    </span>

                    {/* Notification Type Tag */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {formatNotificationType(item.notificationType)}
                    </span>

                    {/* Read / Unread Status */}
                    {item.isRead ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={12} /> Read
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#60a5fa',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#3b82f6',
                          }}
                        />
                        Unread
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Subject & Message */}
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: item.isRead ? 600 : 700,
                    margin: '4px 0 6px',
                    color: item.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                  }}
                >
                  {item.subject}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px',
                    lineHeight: 1.5,
                  }}
                >
                  {item.message}
                </p>

                {/* Footer with Tracking link & Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.trackingNumber && (
                      <Link
                        to={`/track?q=${encodeURIComponent(item.trackingNumber)}`}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--signal, #3b82f6)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'none',
                        }}
                      >
                        <span>Track Parcel ({item.trackingNumber})</span>
                        <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        disabled={actionInProgress === item.id}
                        className="btn btn-outline"
                        style={{
                          padding: '4px 10px',
                          fontSize: 12,
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {actionInProgress === item.id ? 'Marking...' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 20,
                  padding: '12px 0',
                }}
              >
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
