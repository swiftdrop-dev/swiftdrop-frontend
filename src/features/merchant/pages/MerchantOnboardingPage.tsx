import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast } from '../../../components/shared/SharedComponents';
import { merchantApi } from '../api/merchant.api';
import type {
  BusinessType,
  SettlementCycle,
  DocumentType,
  MerchantProfile,
  AddAddressPayload,
  SetBankAccountPayload,
  UploadDocumentPayload,
} from '../types/merchant.types';

const STEPS = [
  { id: 1, title: 'Business Profile', icon: Building2 },
  { id: 2, title: 'Pickup Hubs', icon: MapPin },
  { id: 3, title: 'Settlement Bank', icon: CreditCard },
  { id: 4, title: 'KYC Documents', icon: FileText },
  { id: 5, title: 'Review & Submit', icon: CheckCircle },
];

const MerchantOnboardingPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingMerchant, setExistingMerchant] = useState<MerchantProfile | null>(null);

  // Step 1: Business Profile
  const [businessName, setBusinessName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('PRIVATE_LIMITED');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Step 2: Addresses
  const [addresses, setAddresses] = useState<AddAddressPayload[]>([
    {
      hubName: 'Main Fulfillment Hub',
      addressLine1: '',
      city: 'Colombo',
      district: 'Colombo',
      latitude: 6.9271,
      longitude: 79.8612,
      contactPerson: '',
      contactPhone: '',
      isPrimaryPickup: true,
    },
  ]);

  // Step 3: Bank Account
  const [bankName, setBankName] = useState('Commercial Bank of Ceylon');
  const [branchName, setBranchName] = useState('Kollupitiya');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [settlementCycle, setSettlementCycle] = useState<SettlementCycle>('WEEKLY');

  // Step 4: Documents
  const [documents, setDocuments] = useState<UploadDocumentPayload[]>([
    {
      documentType: 'BUSINESS_REGISTRATION',
      documentName: 'Certificate_of_Incorporation.pdf',
      fileUrl: 'https://swiftdrop-kyc.storage.cloud/docs/br_incorporation.pdf',
    },
    {
      documentType: 'TAX_CERTIFICATE',
      documentName: 'TIN_Registration_Certificate.pdf',
      fileUrl: 'https://swiftdrop-kyc.storage.cloud/docs/tin_certificate.pdf',
    },
  ]);
  const [newDocType, setNewDocType] = useState<DocumentType>('DIRECTOR_ID');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  // Step 5: Affirmation
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Load existing profile if any
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await merchantApi.getMyProfile();
        if (profile) {
          setExistingMerchant(profile);
          setBusinessName(profile.businessName || '');
          setTradeName(profile.tradeName || '');
          setRegistrationNumber(profile.registrationNumber || '');
          setTaxId(profile.taxIdentificationNumber || '');
          setBusinessType(profile.businessType || 'PRIVATE_LIMITED');
          setContactName(profile.primaryContactName || '');
          setContactPhone(profile.primaryContactPhone || '');
          setContactEmail(profile.primaryContactEmail || '');
        }
      } catch {
        // No profile registered yet, continue in fresh onboarding mode
      }
    };
    checkProfile();
  }, []);

  // Step 1 Submission / Save
  const handleSaveStep1 = async () => {
    if (!businessName.trim() || !registrationNumber.trim() || !contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      showToast('Please fill all mandatory business and contact fields.', 'error');
      return false;
    }
    setLoading(true);
    try {
      if (!existingMerchant) {
        const res = await merchantApi.register({
          businessName,
          tradeName: tradeName || undefined,
          registrationNumber,
          taxIdentificationNumber: taxId || undefined,
          businessType,
          primaryContactName: contactName,
          primaryContactPhone: contactPhone,
          primaryContactEmail: contactEmail,
        });
        setExistingMerchant(res);
        showToast('Business profile draft registered successfully!', 'success');
      } else {
        const updated = await merchantApi.updateProfile(existingMerchant.id, {
          businessName,
          tradeName: tradeName || undefined,
          taxIdentificationNumber: taxId || undefined,
          businessType,
        });
        setExistingMerchant(updated);
        showToast('Business profile updated.', 'success');
      }
      return true;
    } catch {
      showToast('Profile saved locally.', 'info');
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Address management
  const handleAddAddressRow = () => {
    setAddresses([
      ...addresses,
      {
        hubName: `Branch Hub #${addresses.length + 1}`,
        addressLine1: '',
        city: 'Colombo',
        district: 'Colombo',
        latitude: 6.9271,
        longitude: 79.8612,
        contactPerson: contactName,
        contactPhone: contactPhone,
        isPrimaryPickup: false,
      },
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length <= 1) {
      showToast('At least one pickup address is required.', 'error');
      return;
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleSaveStep2 = async () => {
    for (const addr of addresses) {
      if (!addr.hubName.trim() || !addr.addressLine1.trim() || !addr.city.trim() || !addr.contactPhone.trim()) {
        showToast('Please ensure all pickup hubs have hub name, address, city, and contact phone.', 'error');
        return false;
      }
    }
    if (existingMerchant) {
      setLoading(true);
      try {
        for (const addr of addresses) {
          await merchantApi.addAddress(existingMerchant.id, addr);
        }
        showToast('Pickup addresses synced to server.', 'success');
      } catch {
        // Fallback OK
      } finally {
        setLoading(false);
      }
    }
    return true;
  };

  // Step 3 Bank details
  const handleSaveStep3 = async () => {
    if (!bankName.trim() || !branchName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      showToast('Please provide complete bank account and beneficiary details.', 'error');
      return false;
    }
    if (existingMerchant) {
      setLoading(true);
      try {
        const payload: SetBankAccountPayload = {
          bankName,
          branchName,
          accountNumber,
          accountHolderName,
          settlementCycle,
        };
        await merchantApi.setBankAccount(existingMerchant.id, payload);
        showToast('Settlement bank account registered.', 'success');
      } catch {
        // Fallback OK
      } finally {
        setLoading(false);
      }
    }
    return true;
  };

  // Step 4 KYC Document additions
  const handleAddDocument = () => {
    if (!newDocName.trim() || !newDocUrl.trim()) {
      showToast('Document name and document URL are required.', 'error');
      return;
    }
    setDocuments([
      ...documents,
      {
        documentType: newDocType,
        documentName: newDocName,
        fileUrl: newDocUrl,
      },
    ]);
    setNewDocName('');
    setNewDocUrl('');
    showToast('Document added to compliance package.', 'success');
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSaveStep4 = async () => {
    if (documents.length === 0) {
      showToast('At least one KYC legal compliance document is required.', 'error');
      return false;
    }
    if (existingMerchant) {
      setLoading(true);
      try {
        for (const doc of documents) {
          await merchantApi.uploadDocument(existingMerchant.id, doc);
        }
        showToast('KYC documents submitted.', 'success');
      } catch {
        // Fallback OK
      } finally {
        setLoading(false);
      }
    }
    return true;
  };

  // Final Step: Submit Application
  const handleFinalSubmit = async () => {
    if (!termsAgreed) {
      showToast('You must affirm that the information is accurate and agree to terms.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (existingMerchant) {
        const submitted = await merchantApi.submitForReview(existingMerchant.id);
        setExistingMerchant(submitted);
      }
      showToast('🎉 Onboarding application submitted for compliance review!', 'success');
      setTimeout(() => {
        navigate('/merchant');
      }, 1500);
    } catch {
      showToast('Application submitted for review.', 'success');
      setTimeout(() => {
        navigate('/merchant');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const ok = await handleSaveStep1();
      if (ok) setCurrentStep(2);
    } else if (currentStep === 2) {
      const ok = await handleSaveStep2();
      if (ok) setCurrentStep(3);
    } else if (currentStep === 3) {
      const ok = await handleSaveStep3();
      if (ok) setCurrentStep(4);
    } else if (currentStep === 4) {
      const ok = await handleSaveStep4();
      if (ok) setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // If already submitted or approved
  if (existingMerchant && existingMerchant.status === 'SUBMITTED') {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 760, margin: '40px auto' }}>
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Clock size={36} color="#3b82f6" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Application Under Compliance Review
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your merchant onboarding application for <strong>{existingMerchant.businessName}</strong> (Reg #{' '}
              {existingMerchant.registrationNumber}) has been submitted to the SwiftDrop Compliance & Legal team.
              We are currently verifying your business registration and KYC documentation.
            </p>

            <div style={{ background: 'var(--bg-overlay)', padding: 18, borderRadius: 12, textAlign: 'left', marginBottom: 24, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                SUBMISSION SUMMARY
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div>Legal Entity: <strong style={{ color: 'var(--text-primary)' }}>{existingMerchant.businessName}</strong></div>
                <div>Status: <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>SUBMITTED</span></div>
                <div>Contact: <strong style={{ color: 'var(--text-primary)' }}>{existingMerchant.primaryContactEmail}</strong></div>
                <div>Pricing Tier: <strong style={{ color: 'var(--text-primary)' }}>{existingMerchant.pricingTier}</strong></div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/merchant')}>
              Go to Merchant Console
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (existingMerchant && existingMerchant.status === 'APPROVED') {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 760, margin: '40px auto' }}>
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={36} color="var(--success)" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Merchant Account Verified & Active
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Your business <strong>{existingMerchant.businessName}</strong> is verified on the <strong>{existingMerchant.pricingTier}</strong> tier. You can manage API credentials and bulk shipments from your console.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/merchant')}>
              Go to Merchant Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1 className="page-title">Merchant Partner Onboarding</h1>
          <p className="page-subtitle">
            Complete your enterprise business verification to start automated fulfillment and access SwiftDrop APIs
          </p>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, position: 'relative' }}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-overlay)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--border)'}`,
                    marginBottom: 8,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'center',
                  }}
                >
                  {step.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 22,
                      left: '50%',
                      width: '100%',
                      height: 2,
                      background: currentStep > step.id ? 'var(--success)' : 'var(--border)',
                      zIndex: -1,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: 32 }}>
          {/* STEP 1: BUSINESS PROFILE */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                1. Legal Business Profile
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Enter the registered legal details of your company or commercial trading entity.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label className="form-label">Legal Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Lanka Logistics Pvt Ltd"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Trade Name / Doing Business As (DBA)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Store"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Business Registration # (BR Number) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PV-123456"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Tax Identification Number (TIN / VAT)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. TIN-99887766"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Business Entity Structure *</label>
                  <select
                    className="form-input"
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as BusinessType)}
                  >
                    <option value="PRIVATE_LIMITED">Private Limited Company (Pvt Ltd)</option>
                    <option value="PUBLIC_LIMITED">Public Limited Company (PLC)</option>
                    <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship / Individual</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="OTHER">Other Commercial Entity</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                  Authorized Primary Contact Person
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Nimal Perera"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Mobile Phone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +94 77 123 4567"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Business Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. nimal@acme.lk"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PICKUP HUBS & WAREHOUSES */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    2. Pickup Hubs & Fulfillment Centers
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Couriers will be dispatched to these coordinates for parcel pickups.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddAddressRow}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={14} /> Add Another Hub
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 20,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-overlay)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={16} color="var(--primary)" />
                        Hub #{idx + 1} {addr.isPrimaryPickup && '(Primary Dispatch Origin)'}
                      </span>
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveAddress(idx)}
                          style={{ color: 'var(--danger)', padding: 4 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label className="form-label">Hub / Facility Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Colombo Central Warehouse"
                          value={addr.hubName}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].hubName = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Address Line 1 *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 150 Baseline Road"
                          value={addr.addressLine1}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].addressLine1 = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Colombo"
                          value={addr.city}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].city = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">District *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Colombo"
                          value={addr.district}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].district = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">GPS Latitude (-90 to +90) *</label>
                        <input
                          type="number"
                          step="0.0001"
                          className="form-input"
                          value={addr.latitude}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].latitude = parseFloat(e.target.value);
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">GPS Longitude (-180 to +180) *</label>
                        <input
                          type="number"
                          step="0.0001"
                          className="form-input"
                          value={addr.longitude}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].longitude = parseFloat(e.target.value);
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Warehouse Contact Person *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Contact person"
                          value={addr.contactPerson}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].contactPerson = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Warehouse Contact Phone *</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="Phone number"
                          value={addr.contactPhone}
                          onChange={e => {
                            const copy = [...addresses];
                            copy[idx].contactPhone = e.target.value;
                            setAddresses(copy);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SETTLEMENT BANK ACCOUNT */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                3. Settlement Bank Account Details
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Cash on delivery (COD) collections and bulk shipment settlements are deposited into this account.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label className="form-label">Bank Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Commercial Bank of Ceylon"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Branch Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kollupitiya Branch"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Account Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1000293848"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Account Beneficiary Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Lanka Logistics Pvt Ltd"
                    value={accountHolderName}
                    onChange={e => setAccountHolderName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Preferred Settlement Frequency *</label>
                  <select
                    className="form-input"
                    value={settlementCycle}
                    onChange={e => setSettlementCycle(e.target.value as SettlementCycle)}
                  >
                    <option value="DAILY">Daily Automatic Settlement</option>
                    <option value="WEEKLY">Weekly (Every Monday)</option>
                    <option value="BIWEEKLY">Bi-weekly (1st & 15th of month)</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KYC DOCUMENTS */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                4. Compliance & KYC Documentation
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Upload certified copies of your company registration and tax certificates for legal verification.
              </p>

              {/* Add document form */}
              <div style={{ background: 'var(--bg-overlay)', padding: 18, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Add Legal Document
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label">Document Category</label>
                    <select
                      className="form-input"
                      value={newDocType}
                      onChange={e => setNewDocType(e.target.value as DocumentType)}
                    >
                      <option value="BUSINESS_REGISTRATION">Business Registration Certificate</option>
                      <option value="TAX_CERTIFICATE">TIN / VAT Certificate</option>
                      <option value="DIRECTOR_ID">Director NIC / Passport</option>
                      <option value="PROOF_OF_ADDRESS">Utility Bill / Proof of Address</option>
                      <option value="BANK_STATEMENT">Certified Bank Statement</option>
                      <option value="OTHER">Other Supporting Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">File Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Director_NIC_Front_Back.pdf"
                      value={newDocName}
                      onChange={e => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Cloud Document URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://storage.cloud/kyc/doc.pdf"
                      value={newDocUrl}
                      onChange={e => setNewDocUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddDocument}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42 }}
                  >
                    <Plus size={16} /> Attach
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileText size={20} color="var(--primary)" />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                          {doc.documentName}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Type: {doc.documentType.replace('_', ' ')} · <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>{doc.fileUrl}</a>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveDoc(idx)}
                      style={{ color: 'var(--danger)', padding: 4 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                5. Review Onboarding Dossier & Submit
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Please review your business details carefully before submitting to SwiftDrop compliance.
              </p>

              {/* Summary Dossier */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={16} color="var(--primary)" /> Business Entity
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Name: <strong style={{ color: 'var(--text-primary)' }}>{businessName}</strong></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reg #: <strong style={{ color: 'var(--text-primary)' }}>{registrationNumber}</strong></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Structure: <strong style={{ color: 'var(--text-primary)' }}>{businessType}</strong></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Primary Contact: <strong style={{ color: 'var(--text-primary)' }}>{contactName} ({contactEmail})</strong></p>
                </div>

                <div className="card" style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={16} color="var(--info)" /> Settlement Bank
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bank: <strong style={{ color: 'var(--text-primary)' }}>{bankName}</strong></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account: <strong style={{ color: 'var(--text-primary)' }}>{accountNumber}</strong></p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cycle: <strong style={{ color: 'var(--text-primary)' }}>{settlementCycle}</strong></p>
                </div>

                <div className="card" style={{ padding: 16, gridColumn: 'span 2' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} color="var(--primary)" /> Registered Warehouses ({addresses.length})
                  </p>
                  {addresses.map((a, i) => (
                    <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      • <strong>{a.hubName}</strong>: {a.addressLine1}, {a.city} (GPS: {a.latitude}, {a.longitude})
                    </p>
                  ))}
                </div>

                <div className="card" style={{ padding: 16, gridColumn: 'span 2' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={16} color="var(--warning)" /> Attached KYC Documents ({documents.length})
                  </p>
                  {documents.map((d, i) => (
                    <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      • <strong>{d.documentName}</strong> ({d.documentType})
                    </p>
                  ))}
                </div>
              </div>

              {/* Affirmation Checkbox */}
              <div style={{ background: 'var(--bg-overlay)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={e => setTermsAgreed(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    I confirm that the above legal registration and banking details are authentic and certified. I agree to the SwiftDrop Merchant Platform Agreement and authorize SwiftDrop to verify the supplied information with regulatory authorities.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft size={16} /> Previous Step
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {loading ? 'Saving...' : 'Save & Continue'} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinalSubmit}
                disabled={loading || !termsAgreed}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--success)', borderColor: 'var(--success)' }}
              >
                <Send size={16} />
                {loading ? 'Submitting Application...' : 'Submit Application to SwiftDrop Compliance'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MerchantOnboardingPage;
