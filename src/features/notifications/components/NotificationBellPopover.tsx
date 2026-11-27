import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, RefreshCw, ExternalLink, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications.api';
import type { NotificationItem } from '../types/notification.types';

export const NotificationBellPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail badge poll to not disturb header
    }
  };

  const fetchRecentNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getNotifications(0, 5);
      setNotifications(data.content);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(prev => !prev);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="header-icon-btn"
        aria-label="Notifications"
        onClick={handleToggle}
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--signal, #ff4d4f)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '1.5px solid var(--bg-raised, #1f1f1f)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 360,
            maxWidth: '90vw',
            maxHeight: 480,
            background: 'var(--bg-raised, #1c1c1e)',
            border: '1px solid var(--border-strong, #333)',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary, #fff)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(255, 77, 79, 0.15)',
                    color: '#ff4d4f',
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary, #999)',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 4px',
                  }}
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={fetchRecentNotifications}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #999)',
                  cursor: 'pointer',
                  padding: 2,
                }}
                title="Refresh notifications"
              >
                <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
            {isLoading && notifications.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted, #777)', fontSize: 12 }}>
                Loading notifications...
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 16,
                  textAlign: 'center',
                  color: 'var(--danger, #ff4d4f)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {!isLoading && !error && notifications.length === 0 && (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted, #888)' }}>
                <Bell size={24} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary, #bbb)', margin: 0 }}>
                  No notifications yet
                </p>
                <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  Delivery updates for your parcels will appear here.
                </p>
              </div>
            )}

            {notifications.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                  background: item.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                {!item.isRead && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 4,
                      top: 14,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--signal, #3b82f6)',
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {item.channel === 'EMAIL' ? <Mail size={10} /> : <MessageSquare size={10} />}
                      Simulated {item.channel}
                    </span>

                    {item.trackingNumber && (
                      <Link
                        to={`/track?q=${encodeURIComponent(item.trackingNumber)}`}
                        onClick={() => setIsOpen(false)}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--text-primary, #fff)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        {item.trackingNumber}
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>

                  <span style={{ fontSize: 10, color: 'var(--text-muted, #777)' }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    fontWeight: item.isRead ? 400 : 600,
                    color: item.isRead ? 'var(--text-secondary, #bbb)' : 'var(--text-primary, #fff)',
                    margin: '4px 0 2px',
                  }}
                >
                  {item.subject}
                </p>

                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted, #888)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {item.message}
                </p>

                {!item.isRead && (
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={e => handleMarkAsRead(item.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #aaa)',
                        fontSize: 10,
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                      }}
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              background: 'rgba(0,0,0,0.15)',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--signal, #3b82f6)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View all notifications &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
