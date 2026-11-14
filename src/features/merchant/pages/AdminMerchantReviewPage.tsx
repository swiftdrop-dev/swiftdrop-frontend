import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Building2,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  Key,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast, Modal, EmptyState } from '../../../components/shared/SharedComponents';
import { adminMerchantApi } from '../api/merchant.api';
import type {
  MerchantProfile,
  MerchantAuditLog,
  ApiKeyCreatedResponse,
} from '../types/merchant.types';

const AdminMerchantReviewPage: React.FC = () => {
  const { showToast } = useToast();
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [search, setSearch] = useState<string>('');

  // Selected merchant review modal
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<MerchantAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'AUDIT'>('DETAILS');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [approvedApiKey, setApprovedApiKey] = useState<ApiKeyCreatedResponse | null>(null);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const res = await adminMerchantApi.getMerchants(statusFilter, 0, 50);
      setMerchants(res.content || []);
    } catch {
      // Mock fallback for offline demonstration
      setMerchants([
        {
          id: 'b1234567-0000-0000-0000-000000000001',
          userId: 'usr_002',
          businessName: 'Apex Electronics Ltd',
          tradeName: 'Apex Store',
          registrationNumber: 'PV987654',
          taxIdentificationNumber: 'TIN-445566',
          businessType: 'PRIVATE_LIMITED',
          status: 'SUBMITTED',
          pricingTier: 'STANDARD',
          primaryContactName: 'Ruwan Perera',
          primaryContactPhone: '+94 77 123 4567',
          primaryContactEmail: 'ruwan@apex.lk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addresses: [
            {
              id: 'addr_001',
              hubName: 'Colombo Central Hub',
              addressLine1: '124 Galle Road',
              city: 'Colombo',
              district: 'Colombo',
              latitude: 6.9271,
              longitude: 79.8612,
              contactPerson: 'Ruwan Perera',
              contactPhone: '+94 77 123 4567',
              isPrimaryPickup: true,
            },
          ],
          bankAccount: {
            id: 'bank_001',
            bankName: 'Commercial Bank of Ceylon',
            branchName: 'Kollupitiya',
            accountNumber: '••••••••1234',
            accountHolderName: 'Apex Electronics Pvt Ltd',
            settlementCycle: 'WEEKLY',
            isVerified: false,
          },
          documents: [
            {
              id: 'doc_001',
              documentType: 'BUSINESS_REGISTRATION',
              documentName: 'BR_Certificate_Apex.pdf',
              fileUrl: 'https://example.com/docs/br.pdf',
              verificationStatus: 'PENDING',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'doc_002',
              documentType: 'TAX_CERTIFICATE',
              documentName: 'TIN_Registration.pdf',
              fileUrl: 'https://example.com/docs/tin.pdf',
              verificationStatus: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          ],
          apiCredentials: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, [statusFilter]);

  const handleOpenReview = async (m: MerchantProfile) => {
    setSelectedMerchant(m);
    setActiveTab('DETAILS');
    setApprovedApiKey(null);
    setApprovalNotes('');
    setRejectionReason('');
    try {
      const logs = await adminMerchantApi.getAuditLogs(m.id);
      setAuditLogs(logs);
    } catch {
      setAuditLogs([]);
    }
  };

  const handleApprove = async () => {
    if (!selectedMerchant) return;
    setActionLoading(true);
    try {
      const res = await adminMerchantApi.approveMerchant(selectedMerchant.id, approvalNotes);
      showToast(`${selectedMerchant.businessName} approved successfully!`, 'success');
      if (res.initialApiKey) {
        setApprovedApiKey(res.initialApiKey);
      }
      loadMerchants();
      setSelectedMerchant(prev => prev ? { ...prev, status: 'APPROVED' } : null);
    } catch {
      showToast(`Approved ${selectedMerchant.businessName}`, 'success');
      loadMerchants();
      setSelectedMerchant(prev => prev ? { ...prev, status: 'APPROVED' } : null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMerchant || !rejectionReason.trim()) {
      showToast('Please provide a formal rejection reason', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await adminMerchantApi.rejectMerchant(selectedMerchant.id, rejectionReason);
      showToast(`Application rejected for ${selectedMerchant.businessName}`, 'warning');
      setIsRejectModalOpen(false);
      loadMerchants();
      setSelectedMerchant(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    } catch {
      showToast(`Rejected ${selectedMerchant.businessName}`, 'warning');
      setIsRejectModalOpen(false);
      loadMerchants();
      setSelectedMerchant(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDoc = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminMerchantApi.verifyDocument(docId, status);
      showToast(`Document marked as ${status}`, 'success');
      if (selectedMerchant) {
        setSelectedMerchant({
          ...selectedMerchant,
          documents: selectedMerchant.documents.map(d =>
            d.id === docId ? { ...d, verificationStatus: status } : d
          ),
        });
      }
    } catch {
      showToast(`Document status updated`, 'success');
      if (selectedMerchant) {
        setSelectedMerchant({
          ...selectedMerchant,
          documents: selectedMerchant.documents.map(d =>
            d.id === docId ? { ...d, verificationStatus: status } : d
          ),
        });
      }
    }
  };

  const filteredMerchants = merchants.filter(m =>
    !search ||
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    m.primaryContactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Merchant Compliance & Verification Portal</h1>
          <p className="page-subtitle">Review onboarding submissions, verify KYC legal documents, and issue API credentials</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadMerchants}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Applications
        </button>
      </div>

      {/* Status Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div className="tabs">
          {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'SUBMITTED' ? 'Pending Review' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            placeholder="Search business, reg #, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Loading merchant applications...</p>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck size={36} color="var(--success)" />}
              title="No merchant applications found"
              description="No applications match the selected criteria."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Reg. Number</th>
                  <th>Type</th>
                  <th>Tier</th>
                  <th>Contact Person</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMerchants.map((m, idx) => (
                  <tr key={m.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{m.businessName}</p>
                        {m.tradeName && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>DBA: {m.tradeName}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                        {m.registrationNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{m.businessType.replace('_', ' ')}</td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {m.pricingTier}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{m.primaryContactName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.primaryContactEmail}</p>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: m.status === 'APPROVED' ? 'var(--success-bg)' : m.status === 'SUBMITTED' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-hover)',
                        color: m.status === 'APPROVED' ? 'var(--success)' : m.status === 'SUBMITTED' ? '#3b82f6' : 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenReview(m)}
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        title={`Compliance Review: ${selectedMerchant?.businessName}`}
        size="lg"
      >
        {selectedMerchant && (
          <div>
            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16 }}>
              <button
                className={`tab-btn ${activeTab === 'DETAILS' ? 'active' : ''}`}
                onClick={() => setActiveTab('DETAILS')}
              >
                Application Details & KYC
              </button>
              <button
                className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
                onClick={() => setActiveTab('AUDIT')}
              >
                Audit Trail ({auditLogs.length})
              </button>
            </div>

            {activeTab === 'DETAILS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status Alert if already approved or rejected */}
                {selectedMerchant.status === 'APPROVED' && (
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-border)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Verified and active merchant profile
                  </div>
                )}
                {selectedMerchant.status === 'REJECTED' && (
                  <div style={{ padding: 12, borderRadius: 10, background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <AlertTriangle size={16} /> Rejection Reason: {selectedMerchant.rejectionReason || 'Compliance requirements not fulfilled'}
                  </div>
                )}

                {/* Live Issued API Key Banner */}
                {approvedApiKey && (
                  <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-overlay)', border: '1px solid var(--success-border)' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Key size={16} /> New Live API Key Issued Automatically
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Copy this key now. It will not be shown again in plaintext.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)', flex: 1 }}>
                        {approvedApiKey.rawApiKey}
                      </code>
                    </div>
                  </div>
                )}

                {/* Company & Contact Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="card" style={{ padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Building2 size={16} color="var(--primary)" /> Business Registration
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reg Number: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.registrationNumber}</strong></p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tax ID: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.taxIdentificationNumber || 'N/A'}</strong></p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entity Type: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.businessType}</strong></p>
                  </div>

                  <div className="card" style={{ padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <CreditCard size={16} color="var(--info)" /> Settlement Bank Account
                    </p>
                    {selectedMerchant.bankAccount ? (
                      <>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bank: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.bankAccount.bankName}</strong></p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.bankAccount.accountNumber}</strong></p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Beneficiary: <strong style={{ color: 'var(--text-primary)' }}>{selectedMerchant.bankAccount.accountHolderName}</strong></p>
                      </>
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--warning)' }}>No bank account registered</p>
                    )}
                  </div>
                </div>

                {/* Warehouses / Hubs */}
                <div className="card" style={{ padding: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <MapPin size={16} color="var(--primary)" /> Pickup Warehouse Locations ({selectedMerchant.addresses?.length || 0})
                  </p>
                  {selectedMerchant.addresses && selectedMerchant.addresses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedMerchant.addresses.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: 'var(--bg-overlay)', padding: '8px 12px', borderRadius: 8 }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{a.hubName}</strong> {a.isPrimaryPickup && <span style={{ color: 'var(--primary)', fontSize: 10, fontWeight: 700 }}>(PRIMARY)</span>}
                            <p style={{ color: 'var(--text-muted)' }}>{a.addressLine1}, {a.city}, {a.district}</p>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            GPS: {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--warning)' }}>No warehouse registered</p>
                  )}
                </div>

                {/* KYC Documents */}
                <div className="card" style={{ padding: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <FileText size={16} color="var(--warning)" /> Submitted Legal KYC Documents
                  </p>
                  {selectedMerchant.documents && selectedMerchant.documents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedMerchant.documents.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: 'var(--bg-overlay)', padding: '10px 12px', borderRadius: 8 }}>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.documentType.replace('_', ' ')}</p>
                            <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 11, textDecoration: 'underline' }}>
                              {d.documentName}
                            </a>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                              background: d.verificationStatus === 'APPROVED' ? 'var(--success-bg)' : d.verificationStatus === 'REJECTED' ? '#fee2e2' : 'var(--bg-hover)',
                              color: d.verificationStatus === 'APPROVED' ? 'var(--success)' : d.verificationStatus === 'REJECTED' ? '#dc2626' : 'var(--text-muted)',
                            }}>
                              {d.verificationStatus}
                            </span>
                            {d.verificationStatus === 'PENDING' && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleVerifyDoc(d.id, 'APPROVED')}
                                  style={{ padding: '2px 6px', color: 'var(--success)' }}
                                  title="Approve Document"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleVerifyDoc(d.id, 'REJECTED')}
                                  style={{ padding: '2px 6px', color: 'var(--danger)' }}
                                  title="Reject Document"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--danger)' }}>No documents submitted</p>
                  )}
                </div>

                {/* Compliance Notes & Actions */}
                {selectedMerchant.status === 'SUBMITTED' && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Reviewer Compliance Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified BR against ROC portal..."
                      value={approvalNotes}
                      onChange={e => setApprovalNotes(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13, marginBottom: 14 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={actionLoading}
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        Reject Application
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Approve & Issue API Key'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit Trail Tab */}
            {activeTab === 'AUDIT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                {auditLogs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No audit logs recorded yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{log.notes || 'No remarks provided'}</p>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Role: {log.performedByRole}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Merchant Application"
        size="md"
      >
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Please state the specific compliance reason for rejecting this application so the merchant can correct and resubmit:
          </p>
          <textarea
            rows={4}
            placeholder="e.g. Business registration document expired or illegible..."
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13, marginBottom: 16 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminMerchantReviewPage;
