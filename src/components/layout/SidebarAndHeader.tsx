import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Package, LayoutDashboard, PlusCircle, List, FileText,
  Truck, MapPin, CheckSquare, BarChart2, Users,
  Settings, LogOut, Menu, X, Bell, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import type { UserRole } from '../../types/global.types';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NAV_BY_ROLE: Record<UserRole, { section: string; items: NavItem[] }[]> = {
  customer: [
    {
      section: 'Main',
      items: [
        { to: '/customer', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/customer/book', icon: <PlusCircle size={18} />, label: 'Book Parcel' },
        { to: '/customer/parcels', icon: <List size={18} />, label: 'My Parcels' },
        { to: '/track', icon: <MapPin size={18} />, label: 'Track Parcel' },
      ],
    },
  ],
  merchant: [
    {
      section: 'Main',
      items: [
        { to: '/merchant', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/merchant/book', icon: <PlusCircle size={18} />, label: 'New Booking' },
        { to: '/merchant/bulk', icon: <FileText size={18} />, label: 'Bulk Booking' },
        { to: '/merchant/parcels', icon: <List size={18} />, label: 'All Shipments' },
        { to: '/track', icon: <MapPin size={18} />, label: 'Track Parcel' },
      ],
    },
  ],
  courier: [
    {
      section: 'Deliveries',
      items: [
        { to: '/courier', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/courier/deliveries', icon: <Truck size={18} />, label: 'My Deliveries', badge: 3 },
        { to: '/courier/proof', icon: <CheckSquare size={18} />, label: 'Proof of Delivery' },
        { to: '/track', icon: <MapPin size={18} />, label: 'Track Parcel' },
      ],
    },
  ],
  dispatcher: [
    {
      section: 'Operations',
      items: [
        { to: '/dispatcher', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/dispatcher/parcels', icon: <Package size={18} />, label: 'All Parcels', badge: 5 },
        { to: '/dispatcher/assign', icon: <Users size={18} />, label: 'Assign Courier' },
        { to: '/dispatcher/reports', icon: <BarChart2 size={18} />, label: 'Reports' },
        { to: '/track', icon: <MapPin size={18} />, label: 'Track Parcel' },
      ],
    },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navGroups = NAV_BY_ROLE[user.role] ?? [];
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(21,20,15,0.5)', zIndex: 99, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="brand-mark">
            <Package size={17} strokeWidth={2.25} />
          </div>
          <div>
            <span className="sidebar-logo-text">Swift<span>Drop</span></span>
            <span className="brand-sub">Courier OS · {user.role}</span>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', color: 'rgba(217,212,200,0.6)', padding: 4 }}
            className="sidebar-close-btn"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.section}>
              <p className="sidebar-section-label">{group.section}</p>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/customer' || item.to === '/merchant' || item.to === '/courier' || item.to === '/dispatcher'}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/settings" className="sidebar-item" onClick={onClose}>
            <Settings size={18} /> <span>Settings</span>
          </NavLink>
          <div className="sidebar-user" onClick={handleLogout} role="button" tabIndex={0} title="Sign out">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-role">{user.role}</p>
            </div>
            <LogOut size={15} color="rgba(217,212,200,0.5)" />
          </div>
        </div>
      </aside>
    </>
  );
};

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [today] = useState(() =>
    new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
  );

  return (
    <header className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="header-crumb">
          <span className="header-crumb-extra">SwiftDrop</span>
          <i className="header-crumb-extra" />
          <b>{title ?? `${user?.role ?? ''} console`}</b>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="header-live"><span className="live-dot" /> {today}</span>

        {/* Notifications */}
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            background: 'var(--signal)', border: '1.5px solid var(--bg-raised)',
          }} />
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button className="header-user-btn" onClick={() => setShowDropdown(p => !p)}>
            <div className="avatar-ink">{user?.name.slice(0, 2).toUpperCase()}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name.split(' ')[0]}
            </span>
            <ChevronDown size={14} />
          </button>

          {showDropdown && (
            <div className="dropdown">
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px dashed var(--border-strong)', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="eyebrow" style={{ marginTop: 2 }}>{user?.role}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); setShowDropdown(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 12, color: 'var(--danger)', fontSize: 13, fontWeight: 600,
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
