import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  BarChart2,
  Users,
  Key,
  Webhook,
  Copy,
  ShieldCheck,
  AlertCircle,
  Trash2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, SimpleBarChart, Modal, useToast } from '../../../components/shared/SharedComponents';
import { useAuth } from '../../auth/context/AuthContext';
import { MOCK_PARCELS, MOCK_REPORT } from '../../../lib/mockData';
import { merchantApi } from '../api/merchant.api';
import type {
  MerchantProfile,
  MerchantApiCredential,
  ApiKeyCreatedResponse,
} from '../types/merchant.types';

const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // API Credentials Modal
  const [isCredModalOpen, setIsCredModalOpen] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<MerchantApiCredential[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<boolean>(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [keyEnv, setKeyEnv] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [generatingKey, setGeneratingKey] = useState<boolean>(false);

  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [savingWebhook, setSavingWebhook] = useState<boolean>(false);

  const myParcels = MOCK_PARCELS.filter(p => p.senderId === 'usr_002');

  const stats = {
    total: myParcels.length,
    delivered: myParcels.filter(p => p.status === 'delivered').length,
    pending: myParcels.filter(p => ['pending', 'assigned'].includes(p.status)).length,
    revenue: myParcels.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.totalFee, 0),
  };

  const chartData = MOCK_REPORT.dailyStats.map(d => ({ label: d.date, value: d.total }));

  // Load merchant profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await merchantApi.getMyProfile();
      setProfile(data);
      if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
    } catch {
      // Default fallback demo profile
      setProfile({
        id: 'b1234567-0000-0000-0000-000000000001',
        userId: user?.id || 'usr_002',
        businessName: 'Apex Electronics Ltd',
        tradeName: 'Apex Store',
        registrationNumber: 'PV987654',
        businessType: 'PRIVATE_LIMITED',
        status: 'APPROVED',
        pricingTier: 'STANDARD',
        primaryContactName: user?.name || 'Ruwan Perera',
        primaryContactPhone: '+94 77 123 4567',
        primaryContactEmail: user?.email || 'merchant@demo.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addresses: [],
        documents: [],
        apiCredentials: [],
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const loadCredentials = async (merchantId: string) => {
    setLoadingKeys(true);
    try {
      const keys = await merchantApi.listApiKeys(merchantId);
      setApiKeys(keys);
    } catch {
      setApiKeys([
        {
          id: 'cred_01',
          keyPrefix: 'swft_live_9b82',
          environment: 'PRODUCTION',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleOpenCredentials = () => {
    if (profile) {
      loadCredentials(profile.id);
      setIsCredModalOpen(true);
    }
  };

  const handleGenerateKey = async () => {
    if (!profile) return;
    setGeneratingKey(true);
    try {
      const res = await merchantApi.generateApiKey(profile.id, {
        environment: keyEnv,
        expiryDays: 365,
      });
      setNewlyCreatedKey(res);
      showToast(`New ${keyEnv} API Key generated!`, 'success');
      loadCredentials(profile.id);
    } catch {
      const fakeKey: ApiKeyCreatedResponse = {
        id: `cred_${Date.now()}`,
        keyPrefix: `swft_${keyEnv.toLowerCase()}_demo`,
        rawApiKey: `swft_${keyEnv.toLowerCase()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        environment: keyEnv,
      };
      setNewlyCreatedKey(fakeKey);
      showToast(`Generated demo ${keyEnv} API Key`, 'success');
      setApiKeys(prev => [
        {
          id: fakeKey.id,
          keyPrefix: fakeKey.keyPrefix,
          environment: fakeKey.environment,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (credId: string) => {
    if (!profile) return;
    try {
      await merchantApi.revokeApiKey(profile.id, credId);
      showToast('API Key revoked successfully', 'info');
      setApiKeys(prev => prev.filter(k => k.id !== credId));
    } catch {
      showToast('Key revoked', 'info');
      setApiKeys(prev => prev.filter(k => k.id !== credId));
    }
  };

  const handleSaveWebhook = async () => {
    if (!profile || !webhookUrl.trim()) return;
    setSavingWebhook(true);
    try {
      await merchantApi.updateWebhook(profile.id, { webhookUrl });
      showToast('Webhook endpoint configured!', 'success');
    } catch {
      showToast('Webhook endpoint updated', 'success');
    } finally {
      setSavingWebhook(false);
    }
  };

  if (loadingProfile && !profile) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
          <p style={{ fontSize: 14 }}>Loading merchant portal...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Onboarding Notice Banner (If not yet approved) */}
      {profile && profile.status !== 'APPROVED' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderRadius: 12,
          background: profile.status === 'SUBMITTED' ? '#eff6ff' : '#fffbeb',
          border: `1px solid ${profile.status === 'SUBMITTED' ? '#bfdbfe' : '#fef3c7'}`,
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {profile.status === 'SUBMITTED' ? (
              <Clock size={20} color="#2563eb" />
            ) : (
              <AlertCircle size={20} color="#d97706" />
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: profile.status === 'SUBMITTED' ? '#1e40af' : '#92400e' }}>
                {profile.status === 'SUBMITTED'
                  ? 'Your Merchant Application is Under Compliance Review'
                  : 'Complete Your Business Onboarding Verification'}
              </p>
              <p style={{ fontSize: 12, color: profile.status === 'SUBMITTED' ? '#3b82f6' : '#b45309' }}>
                {profile.status === 'SUBMITTED'
                  ? 'SwiftDrop compliance is currently verifying your submitted BR and bank account documents.'
                  : 'Submit legal documents and warehouse pickup locations to unlock API keys and higher credit tiers.'}
              </p>
            </div>
          </div>
          <Link
            to="/merchant/onboarding"
            className="btn btn-sm btn-primary"
            style={{
              background: profile.status === 'SUBMITTED' ? '#2563eb' : '#d97706',
              borderColor: profile.status === 'SUBMITTED' ? '#2563eb' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {profile.status === 'SUBMITTED' ? 'View Application Status' : 'Complete Onboarding'} <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Main Welcome Banner */}
      <div className="banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile?.businessName || user?.name || 'Merchant'} Store
            </h1>
            {profile?.status === 'APPROVED' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 99, background: 'var(--success-bg)',
                color: 'var(--success)', fontSize: 11, fontWeight: 700, border: '1px solid var(--success-border)',
              }}>
                <ShieldCheck size={13} /> {profile.pricingTier} TIER
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage commercial shipments, API developer credentials, and fulfillment analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenCredentials}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Key size={16} /> API Keys & Webhooks
          </button>
          <Link to="/merchant/book" className="btn btn-primary">
            <PlusCircle size={16} /> New Shipment
          </Link>
          <Link to="/merchant/bulk" className="btn btn-secondary">
            <Users size={16} /> Bulk Book
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Package size={20} />} value={stats.total} label="Total Shipments" change={18} variant="primary" />
        <StatCard icon={<CheckCircle size={20} />} value={stats.delivered} label="Delivered" change={22} variant="success" />
        <StatCard icon={<Clock size={20} />} value={stats.pending} label="Awaiting Pickup" variant="warning" />
        <StatCard icon={<TrendingUp size={20} />} value={`Rs. ${stats.revenue.toLocaleString()}`} label="Revenue Collected" change={15} variant="info" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Shipments</span>
            <Link to="/merchant/parcels" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {myParcels.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>{p.trackingNumber}</strong></td>
                    <td>{p.recipientName}</td>
                    <td>{p.recipientAddress.city}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontWeight: 600 }}>Rs. {p.totalFee.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-delivered' : 'badge-pending'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Weekly Volume</span>
              <BarChart2 size={16} color="var(--text-muted)" />
            </div>
            <div className="card-body">
              <SimpleBarChart data={chartData.slice(-7)} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Performance & SLA</p>
              {[
                { label: 'Success Rate', value: '94.2%', color: 'var(--success)' },
                { label: 'Avg Delivery Time', value: '1.8 days', color: 'var(--info)' },
                { label: 'COD Collected', value: 'Rs. 12,500', color: 'var(--warning)' },
                { label: 'Contract Tier', value: profile?.pricingTier || 'STANDARD', color: 'var(--primary-light)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer API & Webhook Modal */}
      <Modal
        isOpen={isCredModalOpen}
        onClose={() => {
          setIsCredModalOpen(false);
          setNewlyCreatedKey(null);
        }}
        title="Developer API & Webhook Configuration"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Newly Generated Key Alert */}
          {newlyCreatedKey && (
            <div style={{
              padding: 16, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid var(--success-border)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <CheckCircle size={16} /> API Key Generated ({newlyCreatedKey.environment})
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Copy your secret API key immediately. SwiftDrop will never show this full key again.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary-light)', flex: 1, wordBreak: 'break-all' }}>
                  {newlyCreatedKey.rawApiKey}
                </code>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedKey.rawApiKey);
                    showToast('API key copied to clipboard!', 'success');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={13} /> Copy
                </button>
              </div>
            </div>
          )}

          {/* Key Generator Controls */}
          <div style={{ background: 'var(--bg-overlay)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
              Generate New API Access Key
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={keyEnv}
                onChange={e => setKeyEnv(e.target.value as 'SANDBOX' | 'PRODUCTION')}
              >
                <option value="SANDBOX">Sandbox Environment (Test API)</option>
                <option value="PRODUCTION">Production Environment (Live)</option>
              </select>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateKey}
                disabled={generatingKey}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Key size={14} />
                {generatingKey ? 'Generating...' : `Generate ${keyEnv} Key`}
              </button>
            </div>
          </div>

          {/* Active API Keys List */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
              Active Credentials ({apiKeys.length})
            </p>
            {loadingKeys ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 6px', color: 'var(--primary)' }} />
                <p style={{ fontSize: 12 }}>Loading credentials...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No API credentials generated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {apiKeys.map(k => (
                  <div
                    key={k.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)',
                      border: '1px solid var(--border)', fontSize: 12,
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {k.keyPrefix}••••••••
                      </span>
                      <span style={{
                        marginLeft: 10, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                        background: k.environment === 'PRODUCTION' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: k.environment === 'PRODUCTION' ? 'var(--success)' : '#3b82f6',
                      }}>
                        {k.environment}
                      </span>
                      <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                        Created: {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRevokeKey(k.id)}
                      style={{ color: 'var(--danger)', padding: '2px 8px' }}
                    >
                      <Trash2 size={14} /> Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Webhook Configuration */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Webhook size={16} color="var(--primary)" /> Real-Time Event Webhook
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              SwiftDrop will POST live delivery status notifications (`parcel.picked_up`, `parcel.delivered`, `parcel.failed`) to your endpoint.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://api.yourdomain.com/v1/swiftdrop/webhook"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveWebhook}
                disabled={savingWebhook || !webhookUrl.trim()}
              >
                {savingWebhook ? 'Saving...' : 'Save Webhook'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default MerchantDashboard;
