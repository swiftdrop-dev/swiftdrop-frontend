import React from 'react';

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
import type { ParcelStatus } from '../../types/global.types';
import { Circle, Inbox } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ParcelStatus }> = ({ status }) => {
  const labels: Record<ParcelStatus, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed: 'Failed',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };

  const classes: Record<ParcelStatus, string> = {
    pending: 'badge-pending',
    assigned: 'badge-assigned',
    picked_up: 'badge-picked',
    in_transit: 'badge-transit',
    out_for_delivery: 'badge-transit',
    delivered: 'badge-delivered',
    failed: 'badge-failed',
    cancelled: 'badge-cancelled',
    returned: 'badge-returned',
  };

  return (
    <span className={`badge ${classes[status]}`}>
      <Circle size={6} fill="currentColor" />
      {labels[status]}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// STATUS TIMELINE
// ─────────────────────────────────────────────────────────────
import type { StatusEvent } from '../../types/global.types';
import { CheckCircle, Clock, Loader } from 'lucide-react';

const ALL_STATUSES: ParcelStatus[] = [
  'pending', 'assigned', 'picked_up', 'in_transit', 'delivered',
];

function getStatusIndex(s: ParcelStatus): number {
  return ALL_STATUSES.indexOf(s);
}

export const StatusTimeline: React.FC<{
  history: StatusEvent[];
  currentStatus: ParcelStatus;
}> = ({ history, currentStatus }) => {
  const currentIdx = getStatusIndex(currentStatus);

  return (
    <ul className="timeline" style={{ padding: '8px 0' }}>
      {ALL_STATUSES.map((s, idx) => {
        const event = history.find(h => h.status === s);
        const isDone = idx < currentIdx || currentStatus === 'delivered' && s === 'delivered';
        const isActive = s === currentStatus && currentStatus !== 'delivered';
        const isFail = currentStatus === 'cancelled' || currentStatus === 'failed';

        let iconClass = 'todo';
        if (isDone || (s === currentStatus && currentStatus === 'delivered')) iconClass = 'done';
        else if (isActive) iconClass = 'active';

        const labels: Record<ParcelStatus, string> = {
          pending: 'Booking Confirmed',
          assigned: 'Courier Assigned',
          picked_up: 'Package Picked Up',
          in_transit: 'In Transit',
          out_for_delivery: 'Out for Delivery',
          delivered: 'Delivered',
          failed: 'Delivery Failed',
          cancelled: 'Cancelled',
          returned: 'Returned',
        };

        return (
          <li key={s} className="timeline-item">
            {idx < ALL_STATUSES.length - 1 && !isFail && (
              <span
                className={`timeline-line ${iconClass === 'done' ? 'done' : ''}`}
              />
            )}
            <div className={`timeline-icon ${iconClass}`}>
              {iconClass === 'done' ? <CheckCircle size={14} /> :
               iconClass === 'active' ? <Loader size={14} className="animate-spin" /> :
               <Clock size={14} />}
            </div>
            <div className="timeline-content">
              <p className="timeline-title">{labels[s]}</p>
              {event ? (
                <p className="timeline-meta">
                  {new Date(event.timestamp).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}
                  {event.note && ` — ${event.note}`}
                  {event.location && ` · ${event.location}`}
                </p>
              ) : (
                <p className="timeline-meta">Not yet reached</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon, value, label, change, variant = 'primary',
}) => (
  <div className={`stat-card ${variant} animate-fade-in`}>
    <div className={`stat-icon ${variant}`}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {change !== undefined && (
      <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
        {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(change)}% from last week
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const maxWidths = { sm: 400, md: 520, lg: 720 };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxWidths[size] }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: 4, borderRadius: 10, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = <Inbox size={26} strokeWidth={1.5} />, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────
// SIMPLE BAR CHART
// ─────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-item">
          <div
            className="bar-fill"
            style={{
              height: `${(d.value / max) * 100}%`,
              ...(color ? { background: color } : {}),
            }}
          >
            <span className="bar-value">{d.value}</span>
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import type { UserRole } from '../../types/global.types';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children, allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user!.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useCallback, useRef } from 'react';
import type { Toast, ToastType } from '../../types/global.types';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, type, message }]);
    const t = setTimeout(() => {
      setToasts(p => p.filter(t => t.id !== id));
      timerRef.current.delete(id);
    }, 4000);
    timerRef.current.set(id, t);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={18} color="var(--success)" />,
    error: <XCircle size={18} color="var(--danger)" />,
    warning: <AlertTriangle size={18} color="var(--warning)" />,
    info: <Info size={18} color="var(--info)" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {icons[t.type]}
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{t.message}</span>
            <button
              onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be within ToastProvider');
  return ctx;
};
