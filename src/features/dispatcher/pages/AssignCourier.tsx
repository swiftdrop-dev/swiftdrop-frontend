import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  CheckCircle,
  UserCheck,
  Search,
  Zap,
  MapPin,
  Star,
  RefreshCw,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast, Modal } from '../../../components/shared/SharedComponents';
import { dispatchApi } from '../api/dispatch.api';
import { courierApi } from '../../courier/api/courier.api';
import type { CourierProfile } from '../../courier/types/courier.types';
import type {
  DispatchJobSummary,
  DispatchJobListItem,
  CourierCandidate,
  DispatchPriority,
} from '../types/dispatch.types';

const ASSIGNMENT_RANK: Record<string, number> = {
  IN_PROGRESS: 3,
  ACCEPTED: 2,
  ASSIGNED_PENDING_ACCEPTANCE: 1,
};

function apiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'You are not authorized to perform this dispatch action.';
    }
  }
  return fallback;
}

function jobZone(job: DispatchJobSummary): string {
  return job.pickupZoneCode || job.zoneCode || '';
}

function jobDestination(job: DispatchJobSummary): string {
  return job.destinationCity || job.deliveryCity || '';
}

function indexAssignments(jobs: DispatchJobListItem[]): Record<string, DispatchJobListItem[]> {
  const map: Record<string, DispatchJobListItem[]> = {};
  const seen = new Set<string>();
  for (const job of jobs) {
    if (!job.courierId || seen.has(job.id)) continue;
    seen.add(job.id);
    const current = map[job.courierId] ?? [];
    current.push(job);
    map[job.courierId] = current;
  }
  for (const courierId of Object.keys(map)) {
    map[courierId].sort((left, right) => (ASSIGNMENT_RANK[right.status] ?? 0) - (ASSIGNMENT_RANK[left.status] ?? 0));
  }
  return map;
}

function assignmentText(jobs: DispatchJobListItem[]): string {
  if (jobs.length === 0) return 'No active assignment';
  const primary = jobs[0];
  const label = primary.status === 'ASSIGNED_PENDING_ACCEPTANCE'
    ? 'Offer pending'
    : primary.status === 'ACCEPTED'
      ? 'Accepted'
      : primary.status === 'IN_PROGRESS'
        ? 'In progress'
        : primary.status;
  const extra = jobs.length > 1 ? ` +${jobs.length - 1}` : '';
  return `${label} · ${primary.trackingNumber}${extra}`;
}

const AssignCourier: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [maxRadiusKm, setMaxRadiusKm] = useState('15');
  const [jobs, setJobs] = useState<DispatchJobSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [autoDispatchingId, setAutoDispatchingId] = useState<string | null>(null);

  const [fleet, setFleet] = useState<CourierProfile[]>([]);
  const [fleetLoading, setFleetLoading] = useState<boolean>(true);
  const [fleetError, setFleetError] = useState<string | null>(null);
  const [assignmentStatusError, setAssignmentStatusError] = useState<string | null>(null);
  const [assignmentsByCourier, setAssignmentsByCourier] = useState<Record<string, DispatchJobListItem[]>>({});

  const [activeJob, setActiveJob] = useState<DispatchJobSummary | null>(null);
  const [candidates, setCandidates] = useState<CourierCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [assigningCourierId, setAssigningCourierId] = useState<string | null>(null);
  const [dispatcherNotes, setDispatcherNotes] = useState<string>('');

  const loadUnassignedQueue = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setQueueError(null);
    }
    try {
      const zoneParam = selectedZone === 'ALL' ? undefined : selectedZone;
      const res = await dispatchApi.getUnassignedQueue(zoneParam, page, 20);
      setJobs(Array.isArray(res?.content) ? res.content : []);
      setTotalPages(res?.totalPages ?? 0);
      setTotalElements(res?.totalElements ?? 0);
      setQueueError(null);
    } catch (error) {
      if (!isBackground) {
        setJobs([]);
        setQueueError(apiMessage(error, 'Could not load the unassigned queue.'));
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [selectedZone, page]);

  const loadFleet = useCallback(async () => {
    setFleetLoading(true);
    setFleetError(null);
    try {
      const couriers = await courierApi.getAllCouriers();
      if (!Array.isArray(couriers)) {
        throw new Error('Unexpected courier response');
      }
      setFleet(couriers);
      try {
        const active = await dispatchApi.getActiveAssignments();
        setAssignmentsByCourier(indexAssignments(Array.isArray(active) ? active : []));
        setAssignmentStatusError(null);
      } catch (error) {
        setAssignmentsByCourier({});
        setAssignmentStatusError(apiMessage(error, 'Assignment status is unavailable.'));
      }
    } catch (error) {
      setFleet([]);
      setAssignmentsByCourier({});
      setAssignmentStatusError(null);
      setFleetError(apiMessage(error, 'Could not load the courier fleet.'));
    } finally {
      setFleetLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnassignedQueue();
    const interval = setInterval(() => {
      loadUnassignedQueue(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadUnassignedQueue]);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const canAssign = (courier: CourierCandidate): boolean => {
    const profile = fleet.find((item) => item.id === courier.courierId);
    if (!profile) return true;
    return profile.available === true;
  };

  const handleOpenProximityModal = async (job: DispatchJobSummary) => {
    setActiveJob(job);
    setLoadingCandidates(true);
    setCandidateError(null);
    setCandidates([]);
    setDispatcherNotes('');
    try {
      const radius = Number(maxRadiusKm);
      const res = await dispatchApi.getCandidates(job.id, Number.isFinite(radius) && radius > 0 ? radius : undefined);
      setCandidates(Array.isArray(res) ? res : []);
    } catch (error) {
      setCandidates([]);
      setCandidateError(apiMessage(error, 'Could not load courier candidates.'));
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleManualAssign = async (courier: CourierCandidate) => {
    if (!activeJob || !canAssign(courier)) return;
    setAssigningCourierId(courier.courierId);
    try {
      await dispatchApi.manualAssign(activeJob.id, {
        courierId: courier.courierId,
        dispatcherNotes: dispatcherNotes || 'Assigned via Dispatcher Console Proximity Matcher',
        offerTtlSeconds: 60,
      });
      showToast(`Offer sent to ${courier.courierName} for ${activeJob.trackingNumber}.`, 'success');
      setJobs((prev) => prev.filter((job) => job.id !== activeJob.id));
      setActiveJob(null);
      await loadFleet();
    } catch (error) {
      showToast(apiMessage(error, 'Could not assign this courier.'), 'error');
    } finally {
      setAssigningCourierId(null);
    }
  };

  const handleAutoDispatch = async (job: DispatchJobSummary) => {
    setAutoDispatchingId(job.id);
    try {
      await dispatchApi.autoDispatch(job.id);
      showToast(`Auto-dispatch completed for ${job.trackingNumber}.`, 'success');
      if (activeJob?.id === job.id) setActiveJob(null);
      await loadUnassignedQueue(true);
      await loadFleet();
    } catch (error) {
      showToast(apiMessage(error, 'Auto-dispatch failed.'), 'error');
    } finally {
      setAutoDispatchingId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const destination = jobDestination(job);
    const matchesSearch =
      !search ||
      job.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (job.pickupCity || '').toLowerCase().includes(search.toLowerCase()) ||
      destination.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const getPriorityBadge = (priority: DispatchPriority | string) => {
    const label = priority || 'STANDARD';
    if (label === 'CRITICAL' || label === 'URGENT') {
      return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>{label}</span>;
    }
    if (label === 'HIGH') {
      return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>HIGH</span>;
    }
    if (label === 'LOW') {
      return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#4b5563' }}>LOW</span>;
    }
    return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>{label}</span>;
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
          onClick={() => {
            void loadUnassignedQueue(false);
            void loadFleet();
          }}
          disabled={loading || fleetLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading || fleetLoading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Unassigned Queue ({totalElements})
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            aria-label="Dispatch zone"
            value={selectedZone}
            onChange={(event) => {
              setSelectedZone(event.target.value);
              setPage(0);
            }}
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
              aria-label="Search unassigned jobs"
              placeholder="Search tracking #, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Loading unassigned dispatch queue...</p>
            </div>
          ) : queueError ? (
            <div className="empty-state">
              <h3>Could not load the queue</h3>
              <p>{queueError}</p>
              <button className="btn btn-outline" type="button" onClick={() => loadUnassignedQueue(false)}>
                Retry
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={44} color="var(--success)" style={{ margin: '0 auto 14px' }} />
              <h3>All parcels dispatched</h3>
              <p>No pending jobs awaiting courier assignment in this zone.</p>
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
                {filteredJobs.map((job, index) => (
                  <tr key={job.id} className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                    <td>{getPriorityBadge(job.priority)}</td>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary-light)' }}>
                        {job.trackingNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="var(--primary)" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{job.pickupCity || '—'}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zone: {jobZone(job) || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Navigation size={14} color="var(--text-muted)" />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{jobDestination(job) || '—'}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.destinationDistrict || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {job.requiredVehicleType || '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {job.totalFee != null ? `Rs. ${job.totalFee.toLocaleString()}` : 'Fee unavailable'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {job.createdAt ? new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenProximityModal(job)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <UserCheck size={14} /> Proximity Match
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAutoDispatch(job)}
                          disabled={autoDispatchingId === job.id}
                          title="Trigger automated proximity matching"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', borderColor: '#fcd34d' }}
                        >
                          <Zap size={14} className={autoDispatchingId === job.id ? 'animate-spin' : ''} />
                          {autoDispatchingId === job.id ? 'Matching...' : 'Auto'}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '-12px 0 24px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
            Previous
          </button>
          <button className="btn btn-outline btn-sm" type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Active Fleet Status
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Courier directory and current dispatch assignments
        </span>
      </div>

      {assignmentStatusError && !fleetError && (
        <div className="alert-error" role="status" style={{ marginBottom: 14 }}>
          {assignmentStatusError}
        </div>
      )}

      {fleetLoading ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Loading courier fleet...</p>
          </div>
        </div>
      ) : fleetError ? (
        <div className="card">
          <div className="empty-state">
            <ShieldAlert size={36} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
            <h3>Could not load the courier fleet</h3>
            <p>{fleetError}</p>
            <button className="btn btn-outline" type="button" onClick={() => loadFleet()}>
              Retry
            </button>
          </div>
        </div>
      ) : fleet.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No couriers in the fleet</h3>
            <p>Courier profiles will appear here after they are registered.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {fleet.map((courier, index) => {
            const available = courier.available === true;
            const assignments = assignmentsByCourier[courier.id] ?? [];
            const vehicle = [courier.vehicleType, courier.vehiclePlate].filter(Boolean).join(' · ');
            return (
              <div key={courier.id} className="card animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--grad)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {(courier.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {courier.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {vehicle || 'Vehicle not recorded'}
                      </p>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: available ? 'var(--success-bg)' : 'var(--bg-hover)',
                      color: available ? 'var(--success)' : 'var(--text-muted)',
                      border: `1px solid ${available ? 'var(--success-border)' : 'var(--border)'}`,
                    }}>
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" /> {courier.rating ?? '—'}
                    </span>
                    <span>{courier.deliveriesToday ?? 0} today</span>
                  </div>
                  <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {assignmentStatusError ? 'Assignment status unavailable' : assignmentText(assignments)}
                  </p>
                  {assignments.length > 0 && (
                    <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      {typeof assignments[0].courierLatitude === 'number' && typeof assignments[0].courierLongitude === 'number'
                        ? `Courier GPS: ${assignments[0].courierLatitude.toFixed(4)}, ${assignments[0].courierLongitude.toFixed(4)}`
                        : 'Courier location unavailable'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!activeJob}
        onClose={() => setActiveJob(null)}
        title="Proximity Courier Matching Engine"
        size="lg"
      >
        {activeJob && (
          <div>
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
                  Vehicle Required: {activeJob.requiredVehicleType || '—'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>PICKUP ORIGIN</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeJob.pickupCity || '—'}</p>
                  {typeof activeJob.pickupLatitude === 'number' && typeof activeJob.pickupLongitude === 'number' ? (
                    <p style={{ fontSize: 12 }}>GPS: {activeJob.pickupLatitude.toFixed(4)}, {activeJob.pickupLongitude.toFixed(4)}</p>
                  ) : (
                    <p style={{ fontSize: 12 }}>Location unavailable</p>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>DESTINATION</span>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{jobDestination(activeJob) || '—'}{activeJob.destinationDistrict ? `, ${activeJob.destinationDistrict}` : ''}</p>
                  {typeof activeJob.destinationLatitude === 'number' && typeof activeJob.destinationLongitude === 'number' ? (
                    <p style={{ fontSize: 12 }}>GPS: {activeJob.destinationLatitude.toFixed(4)}, {activeJob.destinationLongitude.toFixed(4)}</p>
                  ) : (
                    <p style={{ fontSize: 12 }}>Location unavailable</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7',
              marginBottom: 20,
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} color="#d97706" /> Automated Proximity Dispatch
                </p>
                <p style={{ fontSize: 12, color: '#b45309' }}>
                  Sends an offer to the nearest available courier returned by dispatch.
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Couriers Ranked by Dispatch ({candidates.length})
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                Radius km
                <input
                  aria-label="Search radius in kilometers"
                  type="number"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={maxRadiusKm}
                  onChange={(event) => setMaxRadiusKm(event.target.value)}
                  style={{ width: 80, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                />
              </label>
            </div>

            {loadingCandidates ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                <p style={{ fontSize: 13 }}>Loading courier candidates...</p>
              </div>
            ) : candidateError ? (
              <div className="empty-state" style={{ padding: '28px 12px' }}>
                <h3>Could not load candidates</h3>
                <p>{candidateError}</p>
                <button className="btn btn-outline" type="button" onClick={() => handleOpenProximityModal(activeJob)}>
                  Retry
                </button>
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <ShieldAlert size={28} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14, fontWeight: 600 }}>No available couriers</p>
                <p style={{ fontSize: 12 }}>Dispatch did not return an online, available courier for this job.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                {candidates.map((courier, rank) => {
                  const assignable = canAssign(courier);
                  return (
                    <div
                      key={courier.courierId}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
                        padding: 14, borderRadius: 14,
                        border: `1px solid ${assignable ? 'var(--border-strong)' : 'var(--border)'}`,
                        background: assignable ? 'var(--bg-overlay)' : 'var(--bg-hover)',
                        opacity: assignable ? 1 : 0.7,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: rank === 0 ? 'var(--primary)' : 'var(--bg-card)',
                          color: rank === 0 ? 'white' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', flexShrink: 0,
                        }}>
                          {rank + 1}
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{courier.courierName}</p>
                            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                              {courier.vehicleType}
                            </span>
                            {!assignable && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Unavailable</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginTop: 2, flexWrap: 'wrap' }}>
                            <span>{courier.courierPhone}</span>
                            <span>{courier.activeDeliveriesCount} active / {courier.maxCapacity} capacity</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-light)' }}>
                            {courier.distanceKm} km
                          </p>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!assignable || assigningCourierId === courier.courierId}
                          onClick={() => handleManualAssign(courier)}
                          style={{ minWidth: 90 }}
                        >
                          {assigningCourierId === courier.courierId ? 'Offering...' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <label htmlFor="dispatcher-notes" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Dispatcher Instructions / Notes (Optional)
              </label>
              <input
                id="dispatcher-notes"
                type="text"
                placeholder="e.g. Call sender upon arrival at pickup gate..."
                value={dispatcherNotes}
                onChange={(event) => setDispatcherNotes(event.target.value)}
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
