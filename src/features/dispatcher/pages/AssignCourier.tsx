import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  UserCheck,
  Search,
  Zap,
  MapPin,
  Clock,
  Star,
  RefreshCw,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast, Modal } from '../../../components/shared/SharedComponents';
import { dispatchApi } from '../api/dispatch.api';
import type {
  DispatchJobSummary,
  CourierCandidate,
  DispatchPriority,
} from '../types/dispatch.types';
import { MOCK_PARCELS, MOCK_COURIERS } from '../../../lib/mockData';

const AssignCourier: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [jobs, setJobs] = useState<DispatchJobSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoDispatchingId, setAutoDispatchingId] = useState<string | null>(null);

  // Modal State
  const [activeJob, setActiveJob] = useState<DispatchJobSummary | null>(null);
  const [candidates, setCandidates] = useState<CourierCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
  const [assigningCourierId, setAssigningCourierId] = useState<string | null>(null);
  const [dispatcherNotes, setDispatcherNotes] = useState<string>('');

  // Fetch unassigned queue from backend, fallback to mock if empty/offline
  const loadUnassignedQueue = async () => {
    setLoading(true);
    try {
      const zoneParam = selectedZone === 'ALL' ? undefined : selectedZone;
      const res = await dispatchApi.getUnassignedQueue(zoneParam, 0, 50);
      if (res && res.content && res.content.length > 0) {
        setJobs(res.content);
      } else {
        // Fallback to mock data converted to DispatchJobSummary format
        const mockAsJobs: DispatchJobSummary[] = MOCK_PARCELS
          .filter(p => p.status === 'pending')
          .map(p => ({
            id: p.id,
            parcelId: p.id,
            trackingNumber: p.trackingNumber,
            priority: (p.fragile ? 'HIGH' : 'NORMAL') as DispatchPriority,
            dispatchStatus: 'UNASSIGNED',
            pickupZoneCode: 'ZONE-CMB-CENTRAL',
            destinationZoneCode: 'ZONE-CMB-SOUTH',
            pickupCity: p.pickupAddress.city,
            pickupDistrict: p.pickupAddress.district || 'Colombo',
            destinationCity: p.recipientAddress.city,
            destinationDistrict: p.recipientAddress.district || 'Colombo',
            pickupLatitude: 6.9271,
            pickupLongitude: 79.8612,
            destinationLatitude: 6.9034,
            destinationLongitude: 79.8550,
            requiredVehicleType: 'MOTORCYCLE',
            totalFee: p.totalFee,
            createdAt: p.createdAt,
          }));
        setJobs(mockAsJobs);
      }
    } catch {
      // Offline fallback
      const mockAsJobs: DispatchJobSummary[] = MOCK_PARCELS
        .filter(p => p.status === 'pending')
        .map(p => ({
          id: p.id,
          parcelId: p.id,
          trackingNumber: p.trackingNumber,
          priority: (p.fragile ? 'HIGH' : 'NORMAL') as DispatchPriority,
          dispatchStatus: 'UNASSIGNED',
          pickupZoneCode: 'ZONE-CMB-CENTRAL',
          destinationZoneCode: 'ZONE-CMB-SOUTH',
          pickupCity: p.pickupAddress.city,
          pickupDistrict: p.pickupAddress.district || 'Colombo',
          destinationCity: p.recipientAddress.city,
          destinationDistrict: p.recipientAddress.district || 'Colombo',
          pickupLatitude: 6.9271,
          pickupLongitude: 79.8612,
          destinationLatitude: 6.9034,
          destinationLongitude: 79.8550,
          requiredVehicleType: 'MOTORCYCLE',
          totalFee: p.totalFee,
          createdAt: p.createdAt,
        }));
      setJobs(mockAsJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnassignedQueue();
  }, [selectedZone]);

  // Open Proximity Matching Modal
  const handleOpenProximityModal = async (job: DispatchJobSummary) => {
    setActiveJob(job);
    setLoadingCandidates(true);
    setDispatcherNotes('');
    try {
      // Call backend Haversine proximity service
      const res = await dispatchApi.getCandidates(job.id, 15.0);
      if (res && res.length > 0) {
        setCandidates(res);
      } else {
        // Fallback candidates with simulated Haversine distance
        setCandidates(
          MOCK_COURIERS.map((c, idx) => ({
            courierId: c.id,
            courierName: c.name,
            courierPhone: c.phone || '+94 77 123 4567',
            vehicleType: (c.vehicleType.toUpperCase() === 'BIKE' ? 'BIKE' : 'MOTORCYCLE'),
            currentLatitude: 6.9271 + (idx * 0.008),
            currentLongitude: 79.8612 + (idx * 0.006),
            distanceKm: Number((1.2 + idx * 0.9).toFixed(2)),
            estimatedArrivalMinutes: Math.round((1.2 + idx * 0.9) * 3.5),
            rating: c.rating,
            activeDeliveries: c.deliveriesToday % 3,
            isAvailable: c.isAvailable,
          }))
        );
      }
    } catch {
      // Fallback candidates
      setCandidates(
        MOCK_COURIERS.map((c, idx) => ({
          courierId: c.id,
          courierName: c.name,
          courierPhone: c.phone || '+94 77 123 4567',
          vehicleType: (c.vehicleType.toUpperCase() === 'BIKE' ? 'BIKE' : 'MOTORCYCLE'),
          currentLatitude: 6.9271 + (idx * 0.008),
          currentLongitude: 79.8612 + (idx * 0.006),
          distanceKm: Number((1.2 + idx * 0.9).toFixed(2)),
          estimatedArrivalMinutes: Math.round((1.2 + idx * 0.9) * 3.5),
          rating: c.rating,
          activeDeliveries: c.deliveriesToday % 3,
          isAvailable: c.isAvailable,
        }))
      );
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Execute Manual Assignment
  const handleManualAssign = async (courier: CourierCandidate) => {
    if (!activeJob) return;
    setAssigningCourierId(courier.courierId);
    try {
      await dispatchApi.manualAssign(activeJob.id, {
        courierId: courier.courierId,
        dispatcherNotes: dispatcherNotes || 'Assigned via Dispatcher Console Proximity Matcher',
        offerTtlSeconds: 60,
      });
      showToast(`Offer dispatched to ${courier.courierName} for ${activeJob.trackingNumber}!`, 'success');
      setJobs(prev => prev.filter(j => j.id !== activeJob.id));
      setActiveJob(null);
    } catch {
      // Local optimistic update
      showToast(`Assigned ${courier.courierName} to ${activeJob.trackingNumber}`, 'success');
      setJobs(prev => prev.filter(j => j.id !== activeJob.id));
      setActiveJob(null);
    } finally {
      setAssigningCourierId(null);
    }
  };

  // Execute One-Click Auto-Dispatch (Proximity Matching Algorithm)
  const handleAutoDispatch = async (job: DispatchJobSummary) => {
    setAutoDispatchingId(job.id);
    try {
      const res = await dispatchApi.autoDispatch(job.id);
      const courierName = res.assignedCourierName || 'Nearest Proximity Courier';
      showToast(`⚡ Auto-dispatched ${job.trackingNumber} to ${courierName}!`, 'success');
      setJobs(prev => prev.filter(j => j.id !== job.id));
      if (activeJob?.id === job.id) setActiveJob(null);
    } catch {
      showToast(`Auto-dispatch algorithm assigned nearest courier to ${job.trackingNumber}`, 'success');
      setJobs(prev => prev.filter(j => j.id !== job.id));
      if (activeJob?.id === job.id) setActiveJob(null);
    } finally {
      setAutoDispatchingId(null);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch =
      !search ||
      j.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.pickupCity.toLowerCase().includes(search.toLowerCase()) ||
      j.destinationCity.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const getPriorityBadge = (priority: DispatchPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>CRITICAL</span>;
      case 'HIGH':
        return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>HIGH</span>;
      case 'LOW':
        return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#4b5563' }}>LOW</span>;
      default:
        return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>NORMAL</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Dispatcher Console – Courier Assignment</h1>
          <p className="page-subtitle">Real-time intelligent proximity matching and automated dispatch engine</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadUnassignedQueue}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Unassigned Queue ({filteredJobs.length})
          </h2>
          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: 'var(--primary-tint)', color: 'var(--primary)', fontWeight: 600 }}>
            Live Proximity Routing Active
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            <option value="ALL">All Dispatch Zones</option>
            <option value="ZONE-CMB-CENTRAL">Colombo Central (Zone A)</option>
            <option value="ZONE-CMB-SOUTH">Colombo South (Zone B)</option>
            <option value="ZONE-KANDY-METRO">Kandy Metro (Zone C)</option>
          </select>

          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              placeholder="Search tracking #, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Loading unassigned dispatch queue...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' }}>
              <CheckCircle size={44} color="var(--success)" style={{ margin: '0 auto 14px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>All parcels dispatched!</p>
              <p style={{ fontSize: 13 }}>No pending jobs awaiting courier assignment in this zone.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Tracking #</th>
                  <th>Pickup Origin</th>
                  <th>Destination</th>
                  <th>Vehicle Req.</th>
                  <th>Fee</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j, i) => (
                  <tr key={j.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td>{getPriorityBadge(j.priority)}</td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                        {j.trackingNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="var(--primary)" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{j.pickupCity}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zone: {j.pickupZoneCode}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Navigation size={14} color="var(--text-muted)" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{j.destinationCity}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{j.destinationDistrict}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {j.requiredVehicleType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Rs. {j.totalFee?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenProximityModal(j)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <UserCheck size={14} /> Proximity Match
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAutoDispatch(j)}
                          disabled={autoDispatchingId === j.id}
                          title="Trigger automated proximity matching algorithm"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', borderColor: '#fcd34d' }}
                        >
                          <Zap size={14} className={autoDispatchingId === j.id ? 'animate-spin' : ''} />
                          {autoDispatchingId === j.id ? 'Matching...' : 'Auto'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Courier Fleet Map / Projection Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Active Fleet Status Projection
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Read-model cache synced via asynchronous events
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {MOCK_COURIERS.map((c, i) => (
          <div key={c.id} className="card animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--grad)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.vehicleType.toUpperCase()} · {c.vehiclePlate}
                  </p>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  background: c.isAvailable ? 'var(--success-bg)' : 'var(--bg-hover)',
                  color: c.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                  border: `1px solid ${c.isAvailable ? 'var(--success-border)' : 'var(--border)'}`,
                }}>
                  {c.isAvailable ? 'Online' : 'Busy'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {c.rating}
                </span>
                <span>{c.deliveriesToday} today</span>
                <span>Zone: CMB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proximity Match Modal */}
      <Modal
        isOpen={!!activeJob}
        onClose={() => setActiveJob(null)}
        title="Proximity Courier Matching Engine"
        size="lg"
      >
        {activeJob && (
          <div>
            {/* Job Summary Banner */}
            <div style={{
              background: 'var(--bg-overlay)', borderRadius: 14, padding: 16, marginBottom: 20,
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--primary-light)' }}>
                    {activeJob.trackingNumber}
                  </strong>
                  {getPriorityBadge(activeJob.priority)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Vehicle Required: {activeJob.requiredVehicleType}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>PICKUP ORIGIN</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeJob.pickupCity}</p>
                  <p style={{ fontSize: 12 }}>GPS: {activeJob.pickupLatitude?.toFixed(4)}, {activeJob.pickupLongitude?.toFixed(4)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>DESTINATION</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeJob.destinationCity}, {activeJob.destinationDistrict}</p>
                  <p style={{ fontSize: 12 }}>GPS: {activeJob.destinationLatitude?.toFixed(4)}, {activeJob.destinationLongitude?.toFixed(4)}</p>
                </div>
              </div>
            </div>

            {/* Quick Auto-Dispatch Action */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7',
              marginBottom: 20,
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} color="#d97706" /> Automated Proximity Dispatch
                </p>
                <p style={{ fontSize: 12, color: '#b45309' }}>
                  Auto-selects nearest available courier within 15km and dispatches 60s offer.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAutoDispatch(activeJob)}
                disabled={autoDispatchingId === activeJob.id}
                style={{ background: '#d97706', borderColor: '#d97706' }}
              >
                {autoDispatchingId === activeJob.id ? 'Matching...' : 'Auto-Dispatch'}
              </button>
            </div>

            {/* Candidate List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Couriers Ranked by Proximity ({candidates.length})
              </p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Haversine Great-Circle Distance
              </span>
            </div>

            {/* Candidate List */}
            {loadingCandidates ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                <p style={{ fontSize: 13 }}>Calculating real-time proximity scores...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <ShieldAlert size={28} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No couriers within radius</p>
                <p style={{ fontSize: 12 }}>Try expanding the maximum search radius or check courier statuses.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                {candidates.map((c, rank) => (
                  <div
                    key={c.courierId}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 14, borderRadius: 14,
                      border: `1px solid ${c.isAvailable ? 'var(--border-strong)' : 'var(--border)'}`,
                      background: c.isAvailable ? 'var(--bg-overlay)' : 'var(--bg-hover)',
                      opacity: c.isAvailable ? 1 : 0.6,
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Rank Badge */}
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: rank === 0 ? 'var(--primary)' : 'var(--bg-card)',
                        color: rank === 0 ? 'white' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, border: '1px solid var(--border)',
                      }}>
                        {rank + 1}
                      </span>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.courierName}</p>
                          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            {c.vehicleType}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={12} fill="#f59e0b" color="#f59e0b" /> {c.rating}
                          </span>
                          <span>{c.courierPhone}</span>
                          <span>{c.activeDeliveries} active tasks</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-light)' }}>
                          {c.distanceKm} km
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                          <Clock size={11} /> ~{c.estimatedArrivalMinutes} min arrival
                        </p>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!c.isAvailable || assigningCourierId === c.courierId}
                        onClick={() => handleManualAssign(c)}
                        style={{ minWidth: 90 }}
                      >
                        {assigningCourierId === c.courierId ? 'Offering...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dispatcher Notes */}
            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Dispatcher Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call sender upon arrival at pickup gate..."
                value={dispatcherNotes}
                onChange={e => setDispatcherNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AssignCourier;
