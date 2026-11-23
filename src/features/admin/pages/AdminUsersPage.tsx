import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Edit2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  Store,
  User,
  Radio,
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useToast, Modal, EmptyState } from '../../../components/shared/SharedComponents';
import { useAuth } from '../../auth/context/AuthContext';
import { adminUserApi } from '../api/admin.api';
import type { UserAdmin, UserStats } from '../types/admin.types';
import type { UserRole } from '../../../types/global.types';

const ROLES: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'ALL', label: 'All Roles', icon: <Users size={14} /> },
  { value: 'customer', label: 'Customer', icon: <User size={14} /> },
  { value: 'merchant', label: 'Merchant', icon: <Store size={14} /> },
  { value: 'courier', label: 'Courier', icon: <Truck size={14} /> },
  { value: 'dispatcher', label: 'Dispatcher', icon: <Radio size={14} /> },
  { value: 'admin', label: 'Admin', icon: <Shield size={14} /> },
];

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modals
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<string>('');
  const [roleSaving, setRoleSaving] = useState<boolean>(false);

  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<boolean>(true);
  const [statusSaving, setStatusSaving] = useState<boolean>(false);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const data = await adminUserApi.getUserStats();
      setStats(data);
    } catch {
      // Graceful fallback if stats call fails
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminUserApi.getUsers(search, roleFilter, statusFilter, page, 15);
      setUsers(data?.content && Array.isArray(data.content) ? data.content : []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Role Change
  const handleOpenRoleModal = (u: UserAdmin) => {
    if (u.id === currentUser?.id) {
      showToast('You cannot modify your own administrator role.', 'error');
      return;
    }
    setSelectedUser(u);
    setNewRole(u.role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setRoleSaving(true);
    try {
      await adminUserApi.updateUserRole(selectedUser.id, newRole);
      showToast(`User role updated to ${newRole.toUpperCase()}`, 'success');
      setRoleModalOpen(false);
      loadUsers();
      loadStats();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setRoleSaving(false);
    }
  };

  // Handle Status Toggle
  const handleOpenStatusModal = (u: UserAdmin, active: boolean) => {
    if (u.id === currentUser?.id && !active) {
      showToast('Admins cannot deactivate their own account.', 'error');
      return;
    }
    setSelectedUser(u);
    setTargetStatus(active);
    setStatusModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedUser) return;
    setStatusSaving(true);
    try {
      await adminUserApi.updateUserStatus(selectedUser.id, targetStatus);
      showToast(
        `Account ${targetStatus ? 'activated' : 'deactivated'} for ${selectedUser.name}`,
        'success'
      );
      setStatusModalOpen(false);
      loadUsers();
      loadStats();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update account status', 'error');
    } finally {
      setStatusSaving(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, { color: string; label: string }> = {
      admin: { color: 'var(--danger)', label: 'Admin' },
      dispatcher: { color: 'var(--primary-light)', label: 'Dispatcher' },
      courier: { color: 'var(--info)', label: 'Courier' },
      merchant: { color: 'var(--warning)', label: 'Merchant' },
      customer: { color: 'var(--success)', label: 'Customer' },
    };
    const c = map[role] || { color: 'var(--text-muted)', label: role };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          background: `${c.color}15`,
          color: c.color,
          border: `1px solid ${c.color}40`,
        }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Search and manage system users, roles, and account access
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            loadUsers();
            loadStats();
          }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Total Users</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.totalUsers}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Active Accounts</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
              {stats.activeUsers}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Deactivated</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)' }}>
              {stats.deactivatedUsers}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Customers</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.customers}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Merchants</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--warning)' }}>
              {stats.merchants}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Couriers</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--info)' }}>
              {stats.couriers}
            </p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="eyebrow">Staff</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary-light)' }}>
              {stats.dispatchers + stats.admins}
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div className="search-input-wrapper" style={{ flex: '1 1 260px' }}>
          <Search size={16} />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input"
            style={{ width: 140, padding: '8px 12px' }}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="tabs">
            {['ALL', 'ACTIVE', 'DEACTIVATED'].map((s) => (
              <button
                key={s}
                className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(0);
                }}
              >
                {s === 'ALL' ? 'All Statuses' : s === 'ACTIVE' ? 'Active' : 'Deactivated'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try adjusting your search query or filters to find what you are looking for."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--primary-glow)',
                              color: 'var(--primary-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.name}{' '}
                              {isCurrent && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontWeight: 700,
                                  }}
                                >
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {u.phone || '—'}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: u.active ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {u.active ? <CheckCircle2 size={13} /> : <UserX size={13} />}
                          {u.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            className="btn btn-ghost btn-sm"
                            title="View Details"
                            onClick={() => {
                              setSelectedUser(u);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            title="Change Role"
                            disabled={isCurrent}
                            onClick={() => handleOpenRoleModal(u)}
                          >
                            <Edit2 size={13} /> Role
                          </button>

                          {u.active ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Deactivate Account"
                              disabled={isCurrent}
                              onClick={() => handleOpenStatusModal(u, false)}
                            >
                              <UserX size={14} /> Deactivate
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--success)' }}
                              title="Activate Account"
                              onClick={() => handleOpenStatusModal(u, true)}
                            >
                              <UserCheck size={14} /> Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Showing {users.length} of {totalElements} users
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontWeight: 600 }}>
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="User Account Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>User ID:</span>
              <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{selectedUser.id}</code>

              <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</strong>

              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <span>{selectedUser.email}</span>

              <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
              <span>{selectedUser.phone || 'Not provided'}</span>

              <span style={{ color: 'var(--text-muted)' }}>Current Role:</span>
              <div>{getRoleBadge(selectedUser.role)}</div>

              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: selectedUser.active ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {selectedUser.status}
              </span>

              <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
              <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Role Management Modal */}
      {selectedUser && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title="Change User Role"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Select a new role for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            <div className="form-group">
              <label className="label">New Role</label>
              <select
                className="input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="merchant">Merchant</option>
                <option value="courier">Courier</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--info)' }} />
              Role changes take effect immediately on subsequent user requests and token refreshes.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setRoleModalOpen(false)}
                disabled={roleSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRole}
                disabled={roleSaving || newRole === selectedUser.role}
              >
                {roleSaving ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Confirmation Modal */}
      {selectedUser && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={targetStatus ? 'Activate User Account' : 'Deactivate User Account'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: targetStatus ? 'var(--success-glow)' : 'var(--danger-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: targetStatus ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {targetStatus ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {targetStatus
                    ? `Activate account for ${selectedUser.name}?`
                    : `Deactivate account for ${selectedUser.name}?`}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {targetStatus
                    ? 'The user will be able to log in and access authorized services.'
                    : 'The user will immediately be blocked from logging in or executing actions.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStatusModalOpen(false)}
                disabled={statusSaving}
              >
                Cancel
              </button>
              <button
                className={`btn ${targetStatus ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleConfirmStatus}
                disabled={statusSaving}
              >
                {statusSaving
                  ? 'Updating...'
                  : targetStatus
                  ? 'Confirm Activation'
                  : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;
