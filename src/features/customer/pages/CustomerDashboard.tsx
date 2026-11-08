import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  List,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  StatCard,
  StatusBadge,
  EmptyState,
} from "../../../components/shared/SharedComponents";

import { useAuth } from "../../auth/context/AuthContext";
import { useParcels } from "../services/parcel-store";

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const parcels = useParcels();

  const myParcels = parcels
    .filter((parcel) => parcel.senderId === user?.id)
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

  const stats = {
    total: myParcels.length,

    delivered: myParcels.filter(
      (parcel) => parcel.status === "delivered",
    ).length,

    pending: myParcels.filter((parcel) =>
      [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "out_for_delivery",
      ].includes(parcel.status),
    ).length,

    cancelled: myParcels.filter(
      (parcel) => parcel.status === "cancelled",
    ).length,
  };

  const recent = myParcels.slice(0, 5);

  const quickActions = [
    {
      icon: <Package size={18} />,
      label: "Book a Parcel",
      description: "Send something new",
      to: "/customer/book",
    },
    {
      icon: <List size={18} />,
      label: "My Parcels",
      description: "View all shipments",
      to: "/customer/parcels",
    },
    {
      icon: <MapPin size={18} />,
      label: "Track Parcel",
      description: "Check your delivery status",
      to: "/track",
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome banner */}
      <div className="banner">
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Welcome back, {user?.name.split(" ")[0] ?? "Customer"}!
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Track, manage, and book your parcels all in one place.
          </p>
        </div>

        <Link to="/customer/book" className="btn btn-primary">
          <PlusCircle size={16} />
          Book New Parcel
        </Link>
      </div>

      {/* Statistics */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={<Package size={20} />}
          value={stats.total}
          label="Total Parcels"
          variant="primary"
        />

        <StatCard
          icon={<CheckCircle size={20} />}
          value={stats.delivered}
          label="Delivered"
          variant="success"
        />

        <StatCard
          icon={<Clock size={20} />}
          value={stats.pending}
          label="In Progress"
          variant="warning"
        />

        <StatCard
          icon={<XCircle size={20} />}
          value={stats.cancelled}
          label="Cancelled"
          variant="danger"
        />
      </div>

      {/* Recent parcels */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Shipments</span>

          <Link
            to="/customer/parcels"
            className="btn btn-ghost btn-sm"
          >
            View All
          </Link>
        </div>

        <div className="table-wrapper">
          {recent.length === 0 ? (
            <EmptyState
              title="No parcels yet"
              description="Book your first parcel to get started."
              action={
                <Link
                  to="/customer/book"
                  className="btn btn-primary"
                >
                  <PlusCircle size={16} />
                  Book Now
                </Link>
              }
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((parcel, index) => (
                  <tr
                    key={parcel.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <td>
                      <strong
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                        }}
                      >
                        {parcel.trackingNumber}
                      </strong>
                    </td>

                    <td>{parcel.recipientName}</td>

                    <td>{parcel.recipientAddress.city}</td>

                    <td>
                      <StatusBadge status={parcel.status} />
                    </td>

                    <td
                      style={{
                        color: "var(--success)",
                        fontWeight: 600,
                      }}
                    >
                      Rs. {parcel.totalFee.toLocaleString()}
                    </td>

                    <td>
                      {new Date(
                        parcel.createdAt,
                      ).toLocaleDateString("en-LK")}
                    </td>

                    <td>
                      <Link
                        to={`/track?q=${encodeURIComponent(
                          parcel.trackingNumber,
                        )}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              transition: "all var(--transition)",
              textDecoration: "none",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor =
                "var(--primary)";
              event.currentTarget.style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor =
                "var(--border-strong)";
              event.currentTarget.style.transform = "";
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                background: "var(--grad)",
                color: "#fff",
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              {action.icon}
            </span>

            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              >
                {action.label}
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {action.description}
              </p>
            </div>

            <ArrowUpRight
              size={16}
              style={{
                marginLeft: "auto",
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            />
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;