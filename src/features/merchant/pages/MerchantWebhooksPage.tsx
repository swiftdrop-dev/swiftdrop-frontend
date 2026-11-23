import React, { useEffect, useState, useCallback } from 'react';
import {
  Webhook,
  PlusCircle,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Eye,
  RefreshCw,
  Play,
} from 'lucide-react';
import { useMerchantProfile } from '../hooks/useMerchantProfile';
import { merchantWebhooksApi } from '../api/merchant-webhooks.api';
import { MerchantDialog } from '../components/MerchantDialog';
import {
  ALL_WEBHOOK_EVENT_TYPES,
  type WebhookDelivery,
  type WebhookDeliveryDetail,
  type WebhookEndpoint,
  type WebhookEventType,
} from '../types/webhook.types';

export default function MerchantWebhooksPage() {
  const profile = useMerchantProfile();
  const merchantId = profile.data?.id;
  const isApproved = profile.data?.status === 'APPROVED';

  const [activeTab, setActiveTab] = useState<'endpoints' | 'logs'>('endpoints');
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [endpointsError, setEndpointsError] = useState<string | null>(null);

  // Delivery logs state
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Detail Modal state
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryDetail | null>(null);
  const [payloadCopied, setPayloadCopied] = useState(false);

  // Register Modal state
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registerUrl, setRegisterUrl] = useState('');
  const [registerDescription, setRegisterDescription] = useState('');
  const [registerEvents, setRegisterEvents] = useState<WebhookEventType[]>(
    ALL_WEBHOOK_EVENT_TYPES.map((e) => e.type)
  );
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Secret reveal modal state
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: 'rotate' | 'delete';
    endpoint: WebhookEndpoint;
  } | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Manual retry in progress tracking
  const [retryingDeliveries, setRetryingDeliveries] = useState<Record<string, boolean>>({});

  const fetchEndpoints = useCallback(async () => {
    if (!merchantId) return;
    setLoadingEndpoints(true);
    setEndpointsError(null);
    try {
      const data = await merchantWebhooksApi.listEndpoints(merchantId);
      setEndpoints(data);
    } catch (err: any) {
      setEndpointsError(err?.response?.data?.message || err?.message || 'Failed to load endpoints');
    } finally {
      setLoadingEndpoints(false);
    }
  }, [merchantId]);

  const fetchDeliveries = useCallback(async () => {
    if (!merchantId) return;
    setLoadingDeliveries(true);
    try {
      const res = await merchantWebhooksApi.getDeliveries(merchantId, {
        eventType: eventTypeFilter || undefined,
        status: statusFilter || undefined,
        page,
        size: 15,
      });
      setDeliveries(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load deliveries', err);
    } finally {
      setLoadingDeliveries(false);
    }
  }, [merchantId, eventTypeFilter, statusFilter, page]);

  useEffect(() => {
    if (merchantId) {
      fetchEndpoints();
    }
  }, [merchantId, fetchEndpoints]);

  useEffect(() => {
    if (merchantId && activeTab === 'logs') {
      fetchDeliveries();
    }
  }, [merchantId, activeTab, fetchDeliveries]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId) return;

    if (!registerUrl.trim()) {
      setRegisterError('Webhook URL is required.');
      return;
    }
    if (!registerUrl.startsWith('https://')) {
      setRegisterError('Webhook URL must use the HTTPS protocol (https://).');
      return;
    }
    if (registerEvents.length === 0) {
      setRegisterError('Select at least one event subscription.');
      return;
    }

    setRegistering(true);
    setRegisterError(null);
    try {
      const created = await merchantWebhooksApi.registerEndpoint(merchantId, {
        url: registerUrl.trim(),
        description: registerDescription.trim() || undefined,
        subscribedEvents: registerEvents,
      });

      setShowRegisterDialog(false);
      setRegisterUrl('');
      setRegisterDescription('');
      setRegisterEvents(ALL_WEBHOOK_EVENT_TYPES.map((e) => e.type));
      setRevealedSecret(created.secret);
      await fetchEndpoints();
    } catch (err: any) {
      setRegisterError(err?.response?.data?.message || err?.message || 'Failed to register webhook');
    } finally {
      setRegistering(false);
    }
  };

  const handleToggle = async (endpoint: WebhookEndpoint) => {
    if (!merchantId) return;
    try {
      const updated = await merchantWebhooksApi.toggleEndpoint(merchantId, endpoint.id);
      setEndpoints((prev) => prev.map((e) => (e.id === endpoint.id ? updated : e)));
    } catch (err) {
      console.error('Failed to toggle endpoint', err);
    }
  };

  const handleConfirmAction = async () => {
    if (!merchantId || !confirmModal) return;
    setActionInProgress(true);
    try {
      if (confirmModal.type === 'rotate') {
        const rotated = await merchantWebhooksApi.rotateSecret(merchantId, confirmModal.endpoint.id);
        setRevealedSecret(rotated.secret);
        await fetchEndpoints();
      } else if (confirmModal.type === 'delete') {
        await merchantWebhooksApi.deleteEndpoint(merchantId, confirmModal.endpoint.id);
        setEndpoints((prev) => prev.filter((e) => e.id !== confirmModal.endpoint.id));
      }
      setConfirmModal(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Action failed');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleViewDetail = async (deliveryId: string) => {
    if (!merchantId) return;
    setPayloadCopied(false);
    try {
      const detail = await merchantWebhooksApi.getDeliveryDetail(merchantId, deliveryId);
      setSelectedDelivery(detail);
    } catch (err) {
      console.error('Failed to load delivery detail', err);
    }
  };

  const handleManualRetry = async (deliveryId: string) => {
    if (!merchantId) return;
    setRetryingDeliveries((prev) => ({ ...prev, [deliveryId]: true }));
    try {
      const updated = await merchantWebhooksApi.retryDelivery(merchantId, deliveryId);
      setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updated : d)));
      if (selectedDelivery && selectedDelivery.id === deliveryId) {
        await handleViewDetail(deliveryId);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Retry failed');
    } finally {
      setRetryingDeliveries((prev) => ({ ...prev, [deliveryId]: false }));
    }
  };

  const copyToClipboard = async (text: string, setStatus: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(true);
      setTimeout(() => setStatus(false), 2500);
    } catch {
      setStatus(false);
    }
  };

  return (
    <div className="merchant-webhooks-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Webhook size={24} color="var(--primary-color, #2563eb)" /> Merchant Webhooks
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
            Configure HTTPS endpoints to receive asynchronous real-time delivery lifecycle events with HMAC-SHA256 signatures.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          disabled={!isApproved}
          onClick={() => {
            setRegisterError(null);
            setShowRegisterDialog(true);
          }}
        >
          <PlusCircle size={16} /> Register Webhook
        </button>
      </div>

      {!isApproved && (
        <div className="merchant-notice merchant-status-pending" role="alert" style={{ marginTop: '16px' }}>
          <strong>Merchant Account Approval Required:</strong> Webhook registrations and delivery dispatching will be enabled once your merchant business profile is approved by administrators.
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color, #e2e8f0)', marginTop: '20px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('endpoints')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: activeTab === 'endpoints' ? '600' : '500',
            color: activeTab === 'endpoints' ? 'var(--primary-color, #2563eb)' : 'var(--text-secondary, #64748b)',
            borderBottom: activeTab === 'endpoints' ? '2px solid var(--primary-color, #2563eb)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Endpoints <span style={{ background: 'var(--bg-secondary, #f1f5f9)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{endpoints.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: activeTab === 'logs' ? '600' : '500',
            color: activeTab === 'logs' ? 'var(--primary-color, #2563eb)' : 'var(--text-secondary, #64748b)',
            borderBottom: activeTab === 'logs' ? '2px solid var(--primary-color, #2563eb)' : '2px solid transparent',
          }}
        >
          Delivery History
        </button>
      </div>

      {/* Tab 1: Endpoints */}
      {activeTab === 'endpoints' && (
        <div>
          {loadingEndpoints ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>Loading webhook endpoints...</div>
          ) : endpointsError ? (
            <div className="merchant-notice merchant-status-rejected" role="alert">{endpointsError}</div>
          ) : endpoints.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center', border: '2px dashed var(--border-color, #e2e8f0)' }}>
              <Webhook size={40} style={{ margin: '0 auto 12px auto', color: 'var(--text-secondary, #94a3b8)' }} />
              <h3 style={{ margin: '0 0 6px 0' }}>No webhook endpoints configured</h3>
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary, #64748b)', fontSize: '14px' }}>
                Register an HTTPS endpoint to automatically receive parcel tracking and delivery status callbacks.
              </p>
              {isApproved && (
                <button type="button" className="btn btn-primary" onClick={() => setShowRegisterDialog(true)}>
                  Register Webhook Endpoint
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {endpoints.map((ep) => (
                <div key={ep.id} className="card" style={{ padding: '20px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: ep.isActive ? '#dcfce7' : '#f1f5f9',
                            color: ep.isActive ? '#15803d' : '#64748b',
                          }}
                        >
                          {ep.isActive ? 'Active' : 'Disabled'}
                        </span>
                        <code style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary, #0f172a)' }}>
                          {ep.url}
                        </code>
                      </div>
                      {ep.description && (
                        <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary, #64748b)', fontSize: '14px' }}>
                          {ep.description}
                        </p>
                      )}

                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary, #64748b)', display: 'block', marginBottom: '4px' }}>
                          Subscribed Events:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {ep.subscribedEvents.map((evt) => (
                            <span
                              key={evt}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'var(--bg-secondary, #f1f5f9)',
                                border: '1px solid var(--border-color, #e2e8f0)',
                                color: 'var(--text-primary, #334155)',
                              }}
                            >
                              {evt}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                        <span>Signing Secret:</span>
                        <code style={{ background: 'var(--bg-secondary, #f1f5f9)', padding: '2px 6px', borderRadius: '4px' }}>
                          {ep.maskedSecret}
                        </code>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '2px 6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setConfirmModal({ type: 'rotate', endpoint: ep })}
                        >
                          <RotateCw size={12} /> Rotate
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '13px' }}
                        onClick={() => handleToggle(ep)}
                      >
                        {ep.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: 'var(--danger-color, #ef4444)', fontSize: '13px' }}
                        onClick={() => setConfirmModal({ type: 'delete', endpoint: ep })}
                        aria-label="Delete endpoint"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Delivery Logs */}
      {activeTab === 'logs' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Event Type</label>
              <select
                className="form-select"
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value);
                  setPage(0);
                }}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="">All Events</option>
                {ALL_WEBHOOK_EVENT_TYPES.map((e) => (
                  <option key={e.type} value={e.type}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Delivery Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="RETRYING">RETRYING</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchDeliveries}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '7px 12px' }}
              >
                <RefreshCw size={14} className={loadingDeliveries ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {loadingDeliveries ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>Loading delivery logs...</div>
          ) : deliveries.length === 0 ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>No webhook deliveries match the current filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px' }}>Event ID</th>
                    <th style={{ padding: '10px 8px' }}>Event Type</th>
                    <th style={{ padding: '10px 8px' }}>Tracking #</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                    <th style={{ padding: '10px 8px' }}>Attempts</th>
                    <th style={{ padding: '10px 8px' }}>HTTP Code</th>
                    <th style={{ padding: '10px 8px' }}>Created</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>
                        {d.eventId ? d.eventId.substring(0, 12) + '...' : d.id.substring(0, 8)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ fontWeight: '600' }}>{d.eventType}</span>
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{d.trackingNumber || '—'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor:
                              d.status === 'SUCCESS'
                                ? '#dcfce7'
                                : d.status === 'RETRYING'
                                  ? '#fef3c7'
                                  : d.status === 'FAILED'
                                    ? '#fee2e2'
                                    : d.status === 'PROCESSING'
                                      ? '#e0e7ff'
                                      : '#e0f2fe',
                            color:
                              d.status === 'SUCCESS'
                                ? '#15803d'
                                : d.status === 'RETRYING'
                                  ? '#b45309'
                                  : d.status === 'FAILED'
                                    ? '#b91c1c'
                                    : d.status === 'PROCESSING'
                                      ? '#4338ca'
                                      : '#0369a1',
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {d.attemptCount} / {d.maxAttempts}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {d.lastHttpStatus ? (
                          <span
                            style={{
                              fontWeight: '600',
                              color: d.lastHttpStatus >= 200 && d.lastHttpStatus < 300 ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {d.lastHttpStatus}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-secondary, #64748b)' }}>
                        {new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleViewDetail(d.id)}
                            title="View Payload & Attempts"
                          >
                            <Eye size={14} /> View
                          </button>
                          {d.status !== 'SUCCESS' && d.status !== 'PROCESSING' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              disabled={retryingDeliveries[d.id]}
                              onClick={() => handleManualRetry(d.id)}
                              title="Trigger manual retry now"
                            >
                              <Play size={12} /> Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
                Showing page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Register Webhook Modal */}
      {showRegisterDialog && (
        <MerchantDialog title="Register Webhook Endpoint" onClose={() => setShowRegisterDialog(false)}>
          <form onSubmit={handleRegister}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary, #64748b)' }}>
              Configure your server endpoint to receive parcel lifecycle event updates. Your endpoint must accept JSON HTTP POST requests.
            </p>

            {registerError && (
              <div className="merchant-notice merchant-status-rejected" role="alert" style={{ marginBottom: '14px', padding: '10px 14px' }}>
                {registerError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                Endpoint URL <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="url"
                className="form-input"
                required
                placeholder="https://api.yourdomain.com/webhooks"
                value={registerUrl}
                onChange={(e) => setRegisterUrl(e.target.value)}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', display: 'block', marginTop: '4px' }}>
                HTTPS is required. SSRF protection prohibits localhost, private RFC-1918, and internal addresses.
              </span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
                Description (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ERP order updates webhook"
                value={registerDescription}
                onChange={(e) => setRegisterDescription(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px' }}>
                  Subscribed Events <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                    onClick={() => setRegisterEvents(ALL_WEBHOOK_EVENT_TYPES.map((e) => e.type))}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                    onClick={() => setRegisterEvents([])}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px' }}>
                {ALL_WEBHOOK_EVENT_TYPES.map((e) => {
                  const checked = registerEvents.includes(e.type);
                  return (
                    <label
                      key={e.type}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: checked ? 'var(--bg-secondary, #f8fafc)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(ev) => {
                          if (ev.target.checked) {
                            setRegisterEvents((prev) => [...prev, e.type]);
                          } else {
                            setRegisterEvents((prev) => prev.filter((t) => t !== e.type));
                          }
                        }}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <strong>{e.label}</strong> (<code>{e.type}</code>)
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)' }}>{e.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterDialog(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={registering}>
                {registering ? 'Registering...' : 'Register Endpoint'}
              </button>
            </div>
          </form>
        </MerchantDialog>
      )}

      {/* Secret Reveal Modal */}
      {revealedSecret && (
        <MerchantDialog title="Save Your Webhook Signing Secret" onClose={() => setRevealedSecret(null)}>
          <div style={{ marginBottom: '14px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
              This signing secret is shown only once. Store it securely in your server environment variables.
              Every webhook request includes an <code>X-SwiftDrop-Signature</code> header signed with this secret.
            </p>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#92400e' }}>
              <strong>Important:</strong> You cannot view this secret again after closing this window.
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                className="form-input"
                value={revealedSecret}
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#f8fafc' }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => copyToClipboard(revealedSecret, setSecretCopied)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {secretCopied ? <Check size={16} /> : <Copy size={16} />}
                {secretCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setRevealedSecret(null)}>
              I have stored this secret safely
            </button>
          </div>
        </MerchantDialog>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <MerchantDialog
          title={confirmModal.type === 'rotate' ? 'Rotate Webhook Secret' : 'Delete Webhook Endpoint'}
          onClose={() => setConfirmModal(null)}
        >
          <div style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
            {confirmModal.type === 'rotate' ? (
              <p>
                Are you sure you want to rotate the secret for <strong>{confirmModal.endpoint.url}</strong>?
                The existing secret will immediately become invalid, and your server will fail HMAC signature verification until updated with the new secret.
              </p>
            ) : (
              <p>
                Are you sure you want to delete the webhook endpoint for <strong>{confirmModal.endpoint.url}</strong>?
                This action is permanent and will stop all future delivery attempts to this endpoint.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={confirmModal.type === 'delete' ? 'btn btn-danger' : 'btn btn-primary'}
              disabled={actionInProgress}
              onClick={handleConfirmAction}
            >
              {actionInProgress ? 'Processing...' : confirmModal.type === 'rotate' ? 'Rotate Secret' : 'Delete Endpoint'}
            </button>
          </div>
        </MerchantDialog>
      )}

      {/* Delivery Detail Modal */}
      {selectedDelivery && (
        <MerchantDialog title="Webhook Delivery Details" onClose={() => setSelectedDelivery(null)}>
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <div>
                <strong>Event ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedDelivery.eventId}</span>
              </div>
              <div>
                <strong>Event Type:</strong> <span>{selectedDelivery.eventType}</span>
              </div>
              <div>
                <strong>Tracking Number:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedDelivery.trackingNumber || '—'}</span>
              </div>
              <div>
                <strong>Status:</strong> <span style={{ fontWeight: '600' }}>{selectedDelivery.status}</span>
              </div>
              <div>
                <strong>Attempt Count:</strong> <span>{selectedDelivery.attemptCount} / {selectedDelivery.maxAttempts}</span>
              </div>
              <div>
                <strong>Last HTTP Code:</strong> <span>{selectedDelivery.lastHttpStatus || 'None'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Endpoint URL:</strong> <code style={{ wordBreak: 'break-all' }}>{selectedDelivery.endpointUrl}</code>
              </div>
              {selectedDelivery.lastError && (
                <div style={{ gridColumn: 'span 2', color: '#b91c1c' }}>
                  <strong>Last Error:</strong> {selectedDelivery.lastError}
                </div>
              )}
            </div>

            {/* Payload Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px' }}>JSON Payload</strong>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => copyToClipboard(selectedDelivery.payload, setPayloadCopied)}
                >
                  {payloadCopied ? <Check size={12} /> : <Copy size={12} />}
                  {payloadCopied ? 'Copied' : 'Copy Payload'}
                </button>
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '220px',
                }}
              >
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedDelivery.payload), null, 2);
                  } catch {
                    return selectedDelivery.payload;
                  }
                })()}
              </pre>
            </div>

            {/* Attempts History */}
            <div>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Delivery Attempts</strong>
              {selectedDelivery.attempts && selectedDelivery.attempts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDelivery.attempts.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        padding: '10px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: 'var(--bg-surface, #ffffff)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>
                          <strong>Attempt #{att.attemptNumber}</strong>
                          {att.httpStatus && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontWeight: '600',
                                color: att.httpStatus >= 200 && att.httpStatus < 300 ? '#15803d' : '#b91c1c',
                              }}
                            >
                              HTTP {att.httpStatus}
                            </span>
                          )}
                        </span>
                        <span style={{ color: 'var(--text-secondary, #64748b)' }}>
                          {att.durationMs != null ? `${att.durationMs}ms · ` : ''}
                          {new Date(att.attemptedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {att.errorMessage && (
                        <div style={{ color: '#b91c1c', marginTop: '4px' }}>
                          <strong>Error:</strong> {att.errorMessage}
                        </div>
                      )}
                      {att.responseBody && (
                        <div style={{ color: 'var(--text-secondary, #64748b)', marginTop: '4px', fontFamily: 'monospace' }}>
                          <strong>Response snippet:</strong> {att.responseBody}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>No delivery attempts logged yet.</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {selectedDelivery.status !== 'SUCCESS' && selectedDelivery.status !== 'PROCESSING' ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={retryingDeliveries[selectedDelivery.id]}
                onClick={() => handleManualRetry(selectedDelivery.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={14} /> Retry Delivery Now
              </button>
            ) : <div />}
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedDelivery(null)}>
              Close
            </button>
          </div>
        </MerchantDialog>
      )}
    </div>
  );
}
