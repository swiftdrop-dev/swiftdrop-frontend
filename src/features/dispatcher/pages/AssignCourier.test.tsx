import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../../components/shared/SharedComponents';
import { courierApi } from '../../courier/api/courier.api';
import type { CourierProfile } from '../../courier/types/courier.types';
import { dispatchApi } from '../api/dispatch.api';
import type { CourierCandidate, DispatchJobListItem, DispatchJobSummary, PageResponse } from '../types/dispatch.types';
import AssignCourier from './AssignCourier';

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'disp-1', name: 'Dispatcher', role: 'dispatcher', email: 'dispatcher@example.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock('../../chatbot', () => ({
  ChatbotWidget: () => null,
}));

vi.mock('../../notifications/components/NotificationBellPopover', () => ({
  NotificationBellPopover: () => null,
}));

vi.mock('../api/dispatch.api', () => ({
  dispatchApi: {
    getUnassignedQueue: vi.fn(),
    getActiveAssignments: vi.fn(),
    getCandidates: vi.fn(),
    manualAssign: vi.fn(),
    autoDispatch: vi.fn(),
  },
}));

vi.mock('../../courier/api/courier.api', () => ({
  courierApi: {
    getAllCouriers: vi.fn(),
  },
}));

const availableCourier: CourierProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Ravi Perera',
  vehicleType: 'MOTORCYCLE',
  vehiclePlate: 'WP-1001',
  rating: 4.7,
  available: true,
  deliveriesToday: 4,
  totalDeliveries: 40,
};

const unavailableCourier: CourierProfile = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Mina Silva',
  vehicleType: 'VAN',
  vehiclePlate: 'WP-2002',
  rating: 4.2,
  available: false,
  deliveriesToday: 0,
  totalDeliveries: 12,
};

const pendingJob: DispatchJobSummary = {
  id: '33333333-3333-3333-3333-333333333333',
  parcelId: '44444444-4444-4444-4444-444444444444',
  trackingNumber: 'SWF-2026-ABC',
  priority: 'HIGH',
  dispatchStatus: 'UNASSIGNED',
  pickupZoneCode: 'ZONE-CMB-CENTRAL',
  destinationZoneCode: 'ZONE-KANDY-METRO',
  pickupCity: 'Colombo',
  pickupDistrict: 'Colombo',
  destinationCity: 'Kandy',
  destinationDistrict: 'Kandy',
  pickupLatitude: 6.9,
  pickupLongitude: 79.8,
  destinationLatitude: 7.2,
  destinationLongitude: 80.6,
  requiredVehicleType: 'MOTORCYCLE',
  totalFee: 850,
  createdAt: '2026-11-27T10:00:00Z',
};

function page<T>(content: T[]): PageResponse<T> {
  return { content, totalElements: content.length, totalPages: 1, size: 50, number: 0 };
}

function candidate(courier: CourierProfile): CourierCandidate {
  return {
    courierId: courier.id,
    courierName: courier.name,
    courierPhone: '+94770000000',
    vehicleType: courier.vehicleType || 'MOTORCYCLE',
    distanceKm: 2.4,
    activeDeliveriesCount: 1,
    maxCapacity: 4,
    matchScore: 3.1,
  };
}

function httpError(status: number, message: string): AxiosError {
  return new AxiosError(message, String(status), undefined, undefined, {
    status,
    statusText: 'error',
    headers: {},
    config: { headers: {} } as InternalAxiosRequestConfig,
    data: { success: false, message },
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AssignCourier />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('AssignCourier fleet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([]));
    vi.mocked(dispatchApi.getActiveAssignments).mockResolvedValue([]);
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([]);
    vi.mocked(dispatchApi.manualAssign).mockResolvedValue({ id: pendingJob.id } as never);
    vi.mocked(dispatchApi.autoDispatch).mockResolvedValue({ id: pendingJob.id } as never);
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([]);
  });

  it('shows a loading state while the courier list is in flight', () => {
    vi.mocked(courierApi.getAllCouriers).mockReturnValue(new Promise(() => undefined));
    renderPage();
    expect(screen.getByText('Loading courier fleet...')).toBeInTheDocument();
  });

  it('loads couriers and their current assignment from the dispatch APIs', async () => {
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([availableCourier, unavailableCourier]);
    const assignment: DispatchJobListItem = {
      id: 'job-accepted',
      parcelId: pendingJob.parcelId,
      trackingNumber: 'SWF-ACCEPTED',
      courierId: availableCourier.id,
      pickupCity: 'Colombo',
      deliveryCity: 'Kandy',
      status: 'ACCEPTED',
      createdAt: '2026-11-27T10:00:00Z',
      courierLatitude: 6.9271,
      courierLongitude: 79.8612,
    };
    vi.mocked(dispatchApi.getActiveAssignments).mockResolvedValue([assignment]);

    renderPage();

    expect(await screen.findByText('Ravi Perera')).toBeInTheDocument();
    expect(screen.getByText('Mina Silva')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Accepted · SWF-ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('Courier GPS: 6.9271, 79.8612')).toBeInTheDocument();
    expect(screen.getByText('No active assignment')).toBeInTheDocument();
    expect(screen.queryByText('Nimal Senanayake')).not.toBeInTheDocument();
    expect(dispatchApi.getActiveAssignments).toHaveBeenCalled();
    expect(dispatchApi.getCandidates).not.toHaveBeenCalled();
  });

  it('requests the selected zone and radius from the server', async () => {
    const user = userEvent.setup();
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([pendingJob]));
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([availableCourier]);
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([candidate(availableCourier)]);

    renderPage();
    await user.selectOptions(await screen.findByLabelText('Dispatch zone'), 'ZONE-CMB-CENTRAL');
    await waitFor(() => {
      expect(dispatchApi.getUnassignedQueue).toHaveBeenCalledWith('ZONE-CMB-CENTRAL', 0, 20);
    });
    await user.click(await screen.findByRole('button', { name: /Proximity Match/ }));
    await waitFor(() => {
      expect(dispatchApi.getCandidates).toHaveBeenCalledWith(pendingJob.id, 15);
    });
  });

  it('shows an empty fleet when the courier directory has no profiles', async () => {
    renderPage();
    expect(await screen.findByText('No couriers in the fleet')).toBeInTheDocument();
    expect(screen.queryByText('Nimal Senanayake')).not.toBeInTheDocument();
  });

  it('shows an error and retries the courier directory', async () => {
    const user = userEvent.setup();
    vi.mocked(courierApi.getAllCouriers)
      .mockRejectedValueOnce(new Error('courier down'))
      .mockResolvedValueOnce([availableCourier]);

    renderPage();

    expect(await screen.findByText('Could not load the courier fleet.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Ravi Perera')).toBeInTheDocument();
    expect(courierApi.getAllCouriers).toHaveBeenCalledTimes(2);
  });

  it('does not offer an unavailable courier', async () => {
    const user = userEvent.setup();
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([unavailableCourier]);
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([pendingJob]));
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([candidate(unavailableCourier)]);

    renderPage();
    await user.click(await screen.findByRole('button', { name: /Proximity Match/ }));

    const assign = await screen.findByRole('button', { name: 'Assign' });
    expect(assign).toBeDisabled();
    await user.click(assign);
    expect(dispatchApi.manualAssign).not.toHaveBeenCalled();
  });

  it('sends an offer through the assignment API and refreshes the fleet', async () => {
    const user = userEvent.setup();
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([availableCourier]);
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([pendingJob]));
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([candidate(availableCourier)]);

    renderPage();
    await user.click(await screen.findByRole('button', { name: /Proximity Match/ }));
    await user.click(await screen.findByRole('button', { name: 'Assign' }));

    await waitFor(() => {
      expect(dispatchApi.manualAssign).toHaveBeenCalledWith(pendingJob.id, expect.objectContaining({
        courierId: availableCourier.id,
      }));
    });
    expect(await screen.findByText(`Offer sent to Ravi Perera for ${pendingJob.trackingNumber}.`)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Proximity Match/ })).not.toBeInTheDocument();
    });
    expect(courierApi.getAllCouriers).toHaveBeenCalledTimes(2);
  });

  it('keeps the job visible when assignment conflicts', async () => {
    const user = userEvent.setup();
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([availableCourier]);
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([pendingJob]));
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([candidate(availableCourier)]);
    vi.mocked(dispatchApi.manualAssign).mockRejectedValue(
      httpError(400, 'Cannot assign courier when job status is: ACCEPTED'),
    );

    renderPage();
    await user.click(await screen.findByRole('button', { name: /Proximity Match/ }));
    await user.click(await screen.findByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Cannot assign courier when job status is: ACCEPTED')).toBeInTheDocument();
    expect(screen.getAllByText(pendingJob.trackingNumber).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Offer sent to/)).not.toBeInTheDocument();
  });

  it('reports unauthorized assignment without creating a local success', async () => {
    const user = userEvent.setup();
    vi.mocked(courierApi.getAllCouriers).mockResolvedValue([availableCourier]);
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([pendingJob]));
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([candidate(availableCourier)]);
    vi.mocked(dispatchApi.manualAssign).mockRejectedValue(httpError(403, 'Access denied'));

    renderPage();
    await user.click(await screen.findByRole('button', { name: /Proximity Match/ }));
    await user.click(await screen.findByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(screen.getAllByText(pendingJob.trackingNumber).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Offer sent to/)).not.toBeInTheDocument();
  });

  it('shows unavailable fee and location when the dispatch summary has no source data', async () => {
    const user = userEvent.setup();
    const blankJob: DispatchJobSummary = {
      ...pendingJob,
      trackingNumber: 'SWF-BLANK',
      totalFee: null,
      pickupLatitude: null,
      pickupLongitude: null,
      destinationLatitude: null,
      destinationLongitude: null,
    };
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue(page([blankJob]));
    vi.mocked(dispatchApi.getCandidates).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Fee unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Proximity Match/ }));
    expect(await screen.findAllByText('Location unavailable')).toHaveLength(2);
    expect(screen.queryByText(/GPS:/)).not.toBeInTheDocument();
  });

  it('loads the next filtered page from the server', async () => {
    const user = userEvent.setup();
    vi.mocked(dispatchApi.getUnassignedQueue).mockResolvedValue({
      content: [pendingJob],
      totalElements: 21,
      totalPages: 2,
      size: 20,
      number: 0,
    });

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(dispatchApi.getUnassignedQueue).toHaveBeenCalledWith(undefined, 1, 20);
    });
  });
});
