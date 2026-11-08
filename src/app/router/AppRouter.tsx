import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

// Public
import LandingPage from '../../components/shared/LandingPage';
import PublicTracking from '../../features/tracking/pages/PublicTracking';

// Auth
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';

// Customer
import CustomerDashboard from '../../features/customer/pages/CustomerDashboard';
import BookParcel from '../../features/customer/pages/BookParcel';
import MyParcels from '../../features/customer/pages/MyParcels';

// Merchant
import MerchantDashboard from '../../features/merchant/pages/MerchantDashboard';
import BulkBooking from '../../features/merchant/pages/BulkBooking';
import MerchantParcels from '../../features/merchant/pages/MerchantParcels';

// Courier
import CourierDashboard from '../../features/courier/pages/CourierDashboard';
import AssignedDeliveries from '../../features/courier/pages/AssignedDeliveries';
import ProofOfDelivery from '../../features/courier/pages/ProofOfDelivery';

// Dispatcher
import DispatcherDashboard from '../../features/dispatcher/pages/DispatcherDashboard';
import AssignCourier from '../../features/dispatcher/pages/AssignCourier';
import Reports from '../../features/dispatcher/pages/Reports';
import DispatcherParcels from '../../features/dispatcher/pages/DispatcherParcels';

import { ProtectedRoute } from '../../components/shared/SharedComponents';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  const redirects: Record<string, string> = {
    customer: '/customer',
    merchant: '/merchant',
    courier: '/courier',
    dispatcher: '/dispatcher',
  };
  return <Navigate to={redirects[user!.role] ?? '/login'} replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/track" element={<PublicTracking />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer */}
        <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/book" element={<ProtectedRoute allowedRoles={['customer']}><BookParcel /></ProtectedRoute>} />
        <Route path="/customer/parcels" element={<ProtectedRoute allowedRoles={['customer']}><MyParcels /></ProtectedRoute>} />

        {/* Merchant */}
        <Route path="/merchant" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/book" element={<ProtectedRoute allowedRoles={['merchant']}><BookParcel /></ProtectedRoute>} />
        <Route path="/merchant/bulk" element={<ProtectedRoute allowedRoles={['merchant']}><BulkBooking /></ProtectedRoute>} />
        <Route path="/merchant/parcels" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantParcels /></ProtectedRoute>} />

        {/* Courier */}
        <Route path="/courier" element={<ProtectedRoute allowedRoles={['courier']}><CourierDashboard /></ProtectedRoute>} />
        <Route path="/courier/deliveries" element={<ProtectedRoute allowedRoles={['courier']}><AssignedDeliveries /></ProtectedRoute>} />
        <Route path="/courier/proof" element={<ProtectedRoute allowedRoles={['courier']}><ProofOfDelivery /></ProtectedRoute>} />

        {/* Dispatcher */}
        <Route path="/dispatcher" element={<ProtectedRoute allowedRoles={['dispatcher']}><DispatcherDashboard /></ProtectedRoute>} />
        <Route path="/dispatcher/parcels" element={<ProtectedRoute allowedRoles={['dispatcher']}><DispatcherParcels /></ProtectedRoute>} />
        <Route path="/dispatcher/assign" element={<ProtectedRoute allowedRoles={['dispatcher']}><AssignCourier /></ProtectedRoute>} />
        <Route path="/dispatcher/reports" element={<ProtectedRoute allowedRoles={['dispatcher']}><Reports /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
