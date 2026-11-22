import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, CalendarDays, MapPin, Package,
  Phone, Search, Truck, UserRound,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { EmptyState, Modal, StatusBadge } from '../../../components/shared/SharedComponents';
import type { ParcelStatus } from '../../../types/global.types';
import { courierDeliveriesApi } from '../api/deliveries.api';
import type { AssignedDelivery } from '../types/delivery.types';
import './AssignedDeliveries.css';

const PAGE_SIZE = 20;
const KNOWN_STATUSES: ParcelStatus[] = [
  'pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery',
  'delivered', 'failed', 'cancelled', 'returned',
];

const formatStatus = (status: string) => status.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
};
const formatScheduledDate = (value: string | null | undefined) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-LK', { dateStyle: 'medium' });
};
const isKnownStatus = (status: string): status is ParcelStatus => KNOWN_STATUSES.includes(status as ParcelStatus);

const AssignedDeliveries: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<AssignedDelivery | null>(null);
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['courier', 'assigned-deliveries', page, PAGE_SIZE],
    queryFn: () => courierDeliveriesApi.getAssignedDeliveries({ page, size: PAGE_SIZE }),
  });

  const statusUpdate = useMutation({
    mutationFn: (input: { parcelId: string; status: 'in_transit' | 'failed'; failureReason?: string }) =>
      courierDeliveriesApi.updateParcelStatus(input.parcelId, { status: input.status, failureReason: input.failureReason }),
  });
  const [failureReason, setFailureReason] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const deliveries = useMemo(() => data?.content ?? [], [data?.content]);
  const availableStatuses = [...new Set(deliveries.map(delivery => delivery.status))];
  const visibleDeliveries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return deliveries.filter(delivery => {
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
      const matchesSearch = !normalizedSearch
        || delivery.parcelId.toLowerCase().includes(normalizedSearch)
        || (delivery.trackingNumber ?? '').toLowerCase().includes(normalizedSearch)
        || (delivery.recipientName ?? '').toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [deliveries, search, statusFilter]);

  const nextStatus = selectedDelivery?.status === 'pending' || selectedDelivery?.status === 'failed'
    ? 'in_transit' : selectedDelivery?.status === 'in_transit' ? 'failed' : null;

  const updateStatus = async () => {
    if (!selectedDelivery || !nextStatus || (nextStatus === 'failed' && !failureReason.trim())) return;
    setStatusUpdateError(null);
    try {
      const result = await statusUpdate.mutateAsync({
        parcelId: selectedDelivery.parcelId, status: nextStatus,
        ...(nextStatus === 'failed' ? { failureReason: failureReason.trim() } : {}),
      });
      setSelectedDelivery(current => current ? { ...current, status: result.status } : current);
      setFailureReason('');
      await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
    } catch (error) {
      setStatusUpdateError(error instanceof Error ? error.message : 'Could not update parcel status. Please retry.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="page-header deliveries-heading">
        <div>
          <h1 className="page-title">Assigned Deliveries</h1>
          <p className="page-subtitle">Deliveries currently assigned to your courier profile</p>
        </div>
        <Link to="/courier" className="btn btn-secondary deliveries-back"><ArrowLeft size={16} /> Dashboard</Link>
      </div>

      <section className="stats-grid deliveries-stats" aria-label="Delivery summary">
        <div className="stat-card primary"><div className="stat-icon primary"><Package size={20} /></div><div className="stat-value">{data?.content.length ?? '—'}</div><div className="stat-label">On this page</div></div>
        <div className="stat-card info"><div className="stat-icon info"><Truck size={20} /></div><div className="stat-value">{data ? (data.hasNext ? 'More' : 'Current') : '—'}</div><div className="stat-label">Assignment list</div></div>
      </section>

      <section className="card deliveries-list-card" aria-label="Assigned delivery list">
        <div className="deliveries-list-heading">
          <div><h2 className="card-title">Your delivery queue</h2><p className="deliveries-muted">Recipient and assignment details from Parcel Service</p></div>
          {data && <span className="deliveries-count">{data.content.length} on this page</span>}
        </div>
        <div className="deliveries-toolbar">
          <label className="deliveries-search">
            <Search size={17} aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search parcel ID, tracking number or recipient" aria-label="Search parcel ID, tracking number or recipient" />
          </label>
          <label className="deliveries-filter-label"><span>Status</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              {availableStatuses.map(status => <option key={status} value={status}>{formatStatus(status)}</option>)}
            </select>
          </label>
        </div>
        <p className="deliveries-details-note">Search and status filters apply to the loaded page. Pickup details are not part of the current API response.</p>

        {isPending ? (
          <div className="delivery-skeletons" role="status" aria-label="Loading assigned deliveries">
            {[0, 1, 2].map(row => <div className="delivery-skeleton" key={row}><span /><span /><span /></div>)}
          </div>
        ) : isError ? (
          <EmptyState icon={<AlertCircle size={27} strokeWidth={1.5} />} title="Couldn't load assigned deliveries" description="Check your connection and try again. Your courier identity is resolved by the authenticated backend session." action={<button className="btn btn-primary" onClick={() => void refetch()} disabled={isFetching}>{isFetching ? 'Retrying…' : 'Retry'}</button>} />
        ) : deliveries.length === 0 ? (
          <EmptyState icon={<Package size={27} strokeWidth={1.5} />} title="No assigned deliveries" description="Deliveries assigned to your courier profile will appear here." />
        ) : visibleDeliveries.length === 0 ? (
          <EmptyState icon={<Search size={27} strokeWidth={1.5} />} title="No matching deliveries" description="Try a different parcel, recipient or status filter." action={<button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>} />
        ) : (
          <div className="assigned-delivery-list">
            {visibleDeliveries.map(delivery => (
              <article className="assigned-delivery-card" key={delivery.assignmentId}>
                <div className="assigned-delivery-card-header">
                  <div><strong className="assigned-delivery-tracking">{delivery.trackingNumber || delivery.parcelId}</strong><span className="assigned-delivery-parcel-id">Parcel {delivery.parcelId}</span></div>
                  {isKnownStatus(delivery.status) ? <StatusBadge status={delivery.status} /> : <span className="badge badge-assigned">{formatStatus(delivery.status)}</span>}
                </div>
                <div className="assigned-delivery-details">
                  <div><span><UserRound size={14} /> Recipient</span><strong>{delivery.recipientName || 'Unavailable'}</strong>{delivery.recipientPhone && <a href={`tel:${delivery.recipientPhone}`}><Phone size={13} /> {delivery.recipientPhone}</a>}</div>
                  <div><span><MapPin size={14} /> Delivery address</span><strong>{delivery.deliveryAddress || 'Unavailable'}</strong></div>
                  <div><span><CalendarDays size={14} /> Assigned</span><strong>{formatDate(delivery.assignedAt)}</strong></div>
                  <div><span><CalendarDays size={14} /> Scheduled</span><strong>{formatScheduledDate(delivery.scheduledDate)}</strong></div>
                </div>
                <div className="assigned-delivery-card-footer"><span>Assignment #{delivery.assignmentId}</span><button className="btn btn-secondary btn-sm" onClick={() => setSelectedDelivery(delivery)}>View details <ArrowRight size={15} /></button></div>
              </article>
            ))}
          </div>
        )}
        {data && deliveries.length > 0 && <nav className="deliveries-pagination" aria-label="Assigned delivery pages">
          <span>Page {data.page + 1}{isFetching ? ' · Updating' : ''}</span>
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0 || isFetching}><ArrowLeft size={15} /> Previous</button>
            <button className="btn btn-primary btn-sm" onClick={() => setPage(current => current + 1)} disabled={!data.hasNext || isFetching}>Next <ArrowRight size={15} /></button>
          </div>
        </nav>}
      </section>

      <Modal isOpen={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} title="Delivery details" size="md">
        {selectedDelivery && <div className="courier-detail-modal">
          <div className="courier-detail-modal-heading"><strong>{selectedDelivery.trackingNumber || selectedDelivery.parcelId}</strong>{isKnownStatus(selectedDelivery.status) ? <StatusBadge status={selectedDelivery.status} /> : <span className="badge badge-assigned">{formatStatus(selectedDelivery.status)}</span>}</div>
          <dl>
            <div><dt>Parcel ID</dt><dd>{selectedDelivery.parcelId}</dd></div>
            <div><dt>Assignment ID</dt><dd>{selectedDelivery.assignmentId}</dd></div>
            <div><dt>Recipient</dt><dd>{selectedDelivery.recipientName || 'Unavailable'}</dd></div>
            <div><dt>Phone</dt><dd>{selectedDelivery.recipientPhone || 'Unavailable'}</dd></div>
            <div><dt>Delivery address</dt><dd>{selectedDelivery.deliveryAddress || 'Unavailable'}</dd></div>
            <div><dt>Scheduled date</dt><dd>{formatScheduledDate(selectedDelivery.scheduledDate)}</dd></div>
            <div><dt>Assigned at</dt><dd>{formatDate(selectedDelivery.assignedAt)}</dd></div>
            <div><dt>Pickup address</dt><dd>Not provided by the current Parcel Service API</dd></div>
          </dl>
          {nextStatus && <div className="courier-status-actions">
            <h3>Update delivery status</h3>
            {nextStatus === 'failed' && <label className="form-group">
              <span className="form-label">Failure reason</span>
              <textarea className="form-input" rows={3} maxLength={1000} value={failureReason}
                onChange={event => setFailureReason(event.target.value)} placeholder="Explain why delivery could not be completed" />
            </label>}
            {statusUpdateError && <p role="alert" className="text-danger">{statusUpdateError}</p>}
            <button className="btn btn-primary" type="button" onClick={() => void updateStatus()}
              disabled={statusUpdate.isPending || (nextStatus === 'failed' && !failureReason.trim())}>
              {statusUpdate.isPending ? 'Updating…' : nextStatus === 'failed' ? 'Report failed delivery'
                : selectedDelivery.status === 'failed' ? 'Retry delivery' : 'Start delivery'}
            </button>
            <p className="deliveries-muted">Parcel Service validates status transitions. Delivery completion still requires both proofs.</p>
          </div>}
        </div>}
      </Modal>
    </DashboardLayout>
  );
};

export default AssignedDeliveries;
